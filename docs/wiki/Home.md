# StateGuard.js

StateGuard.js watches the attributes of DOM elements and reverts changes that did not go through its own update gateway. The typical use is keeping a `disabled` button disabled, or a `readonly` field read-only, when someone edits it in DevTools.

- **Package:** `@rsuthar/state-guard-js` (v1.1.0, MIT)
- **Runtime:** browsers (needs `MutationObserver` and `window`)
- **Size:** one file, [src/StateGuard.js](https://github.com/rmsuthar/StateGuard/blob/main/src/StateGuard.js), about 1.7 KB gzipped, no dependencies

> **Important:** StateGuard makes casual tampering harder. It is not an access-control mechanism. Anything running in the page, including the DevTools console, can call `StateGuard.update()` or replace the element. Always enforce permissions on the server. See [Security Model](Security-Model).

## Repository map

| Path | What it is |
|---|---|
| `src/StateGuard.js` | Core library (UMD): the global `StateGuard`, or `module.exports` |
| `src/useStateGuard.js` | React hook adapter |
| `src/state-guard.dir.ts` | Angular standalone directive |
| `server/violation-logger.js` | Example Express endpoint: validates, rate-limits and logs tamper reports |
| `dist/state-guard.min.js` | Terser-minified build (the package `main`) |
| `dist/state-guard.obf.js` | Obfuscated build (`javascript-obfuscator --self-defending`) |
| `index.html` | Local demo page |
| `tests/` | Jest suites: core (jsdom), Node/SSR import, dist consistency |
| `scripts/sync-version.js` | Copies the package version into the source during `npm version` |
| `docs/` | GitHub Pages site and short reference pages |
| `.github/workflows/ci.yml` | CI: Node 18/20/22, build, test, stale-`dist/` check, upload |

## Quick links

- New here? Start with [Getting Started](Getting-Started).
- Integrating? See the [API Reference](API-Reference) and [Framework Integration](Framework-Integration).
- Contributing? See [Development](Development) and [Known Issues](Known-Issues).
