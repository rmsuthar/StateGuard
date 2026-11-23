/**
 * Example endpoint for StateGuard tamper reports.
 *
 *   npm install express
 *   node server/violation-logger.js        # PORT defaults to 3000
 *
 * Reports are untrusted client input: they are validated, truncated, stripped of
 * control characters and written as one JSON object per line (no log injection).
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const LOG_FILE = process.env.STATEGUARD_LOG || path.join(__dirname, 'tamper-incidents.log');
const CRITICAL_ATTEMPTS = 10;
const RATE_LIMIT = { windowMs: 60_000, max: 30 }; // per IP

const app = express();
app.set('trust proxy', process.env.TRUST_PROXY || false);
app.use(express.json({ limit: '4kb' }));

const clean = (value, max = 256) =>
    value == null ? null : String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, max);

// Minimal in-memory rate limiter (use a shared store such as Redis in production).
const hits = new Map();
function rateLimit(req, res, next) {
    const now = Date.now();
    const entry = hits.get(req.ip);
    if (!entry || now - entry.start > RATE_LIMIT.windowMs) {
        hits.set(req.ip, { start: now, count: 1 });
        return next();
    }
    if (++entry.count > RATE_LIMIT.max) return res.status(429).json({ status: 'rate_limited' });
    return next();
}
setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT.windowMs;
    for (const [ip, e] of hits) if (e.start < cutoff) hits.delete(ip);
}, RATE_LIMIT.windowMs).unref();

app.post('/api/security/violation', rateLimit, (req, res) => {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return res.status(400).json({ status: 'invalid', error: 'JSON object expected' });
    }
    const attempts = Number.parseInt(body.attempts, 10);
    if (!Number.isFinite(attempts) || attempts < 0) {
        return res.status(400).json({ status: 'invalid', error: "'attempts' must be a non-negative integer" });
    }

    const entry = {
        receivedAt: new Date().toISOString(), // server time; client time is informational only
        ip: req.ip,
        elementId: clean(body.elementId, 128),
        elementTag: clean(body.elementTag, 32),
        attribute: clean(body.attribute, 64),
        attempts,
        clientTimestamp: clean(body.timestamp, 64),
        userAgent: clean(body.userAgent || req.get('user-agent'), 512)
    };
    const line = JSON.stringify(entry);

    console.warn('[StateGuard] tamper report', line);
    fs.appendFile(LOG_FILE, line + '\n', err => {
        if (err) console.error('[StateGuard] failed to write security log:', err);
    });

    if (attempts > CRITICAL_ATTEMPTS) {
        // Hook your alerting (Slack, email, SIEM) in here.
        console.error(`[StateGuard] CRITICAL: high-frequency tampering from ${req.ip}`);
    }

    return res.status(202).json({ status: 'received' });
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`StateGuard violation logger listening on port ${PORT}`));
}

module.exports = app;
