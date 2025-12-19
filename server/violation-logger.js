const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

// Path to your security log file
const LOG_FILE = path.join(__dirname, 'tamper-incidents.log');

/**
 * Endpoint to receive tamper reports from StateGuard.js
 */
app.post('/api/security/violation', (req, res) => {
    const { elementId, elementTag, attempts, timestamp, userAgent, clientIp } = req.body;

    const logEntry = `
[${timestamp}] SECURITY ALERT
IP: ${req.ip}
User-Agent: ${userAgent}
Element: <${elementTag} id="${elementId}">
Attempts: ${attempts}
------------------------------------------`;

    // 1. Log to server console for real-time monitoring
    console.warn(logEntry);

    // 2. Append to a physical log file
    fs.appendFile(LOG_FILE, logEntry + '\n', (err) => {
        if (err) console.error('Failed to write to security log:', err);
    });

    // 3. Logic for high-frequency attackers
    if (attempts > 10) {
        // Trigger an internal notification (e.g., Slack or Email)
        console.error(`!!! CRITICAL: High-frequency tampering detected from ${req.ip} !!!`);
    }

    res.status(200).json({ status: 'received', action: 'logged' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`StateGuard Security Server running on port ${PORT}`);
});