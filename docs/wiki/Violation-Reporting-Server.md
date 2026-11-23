# Violation Reporting Server

[server/violation-logger.js](../../server/violation-logger.js) is an **example** Express server for receiving tamper reports sent from `onViolation`.

## Running it

`express` is not listed in `package.json`, so install it first:

```bash
npm install express
node server/violation-logger.js   # PORT env var, default 3000
```

## Endpoint

`POST /api/security/violation` with a JSON body:

```json
{
  "elementId": "pay",
  "elementTag": "BUTTON",
  "attempts": 4,
  "timestamp": "2026-11-23T10:00:00.000Z",
  "userAgent": "Mozilla/5.0 ..."
}
```

The server writes a block to its console and appends it to `server/tamper-incidents.log`. If `attempts > 10`, it also prints a "CRITICAL" line. The response is always `200 {"status":"received","action":"logged"}`.

The README's client example posts to `/api/security/log-tamper`, which does not match this route.

## Before using it in production

- **Log injection.** Client fields go straight into a multi-line log entry. A `userAgent` containing newlines can forge entries. Strip control characters or log structured JSON.
- **Trusted client data.** `timestamp` and `attempts` come from the client. Record a server-side timestamp instead.
- **No validation, rate limiting, auth or body-size limit.** Anyone can flood the log file.
- `req.ip` is the proxy's address when the server runs behind a proxy, unless you set `app.set('trust proxy', ...)`. The `clientIp` field is read from the body but never used.
- Cross-origin pages cannot post to it because there is no CORS setup (that may be intended).
