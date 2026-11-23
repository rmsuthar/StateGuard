# Violation Reporting Server

[server/violation-logger.js](https://github.com/rmsuthar/StateGuard/blob/main/server/violation-logger.js) is an **example** Express endpoint for tamper reports. `express` is not a dependency of the library, so install it separately.

```bash
npm install express
node server/violation-logger.js
```

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Listen port |
| `STATEGUARD_LOG` | `server/tamper-incidents.log` | Log file path |
| `TRUST_PROXY` | off | Passed to `app.set('trust proxy')` so that `req.ip` is correct behind a proxy |

The module exports `app`. It only starts listening when run directly, so you can mount it or test it with supertest.

## `POST /api/security/violation`

```json
{ "elementId": "pay", "elementTag": "BUTTON", "attribute": "disabled",
  "attempts": 4, "timestamp": "2026-11-23T10:00:00.000Z" }
```

| Response | When |
|---|---|
| `202 {"status":"received"}` | Logged |
| `400 {"status":"invalid", ...}` | Body is not an object, or `attempts` is not a non-negative integer |
| `429 {"status":"rate_limited"}` | More than 30 reports per IP per minute |
| `413` | Body larger than 4 KB |

Each report is written as **one JSON line**, with a server-side `receivedAt` timestamp. String fields are truncated and stripped of control characters, which prevents log injection. If `attempts > 10`, the server also logs a CRITICAL line. That is the place to connect your alerting.

## Production notes
- The rate limiter is in memory and per process. Use a shared store (such as Redis) when running several instances.
- Add authentication (a session or CSRF token) if you want to link reports to users.
- Cross-origin pages cannot post to it because there is no CORS setup.
