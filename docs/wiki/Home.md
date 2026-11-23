# StateGuard.js

StateGuard.js watches the attributes of DOM elements and reverts changes that did not go through its own update gateway. The typical use is keeping a `disabled` button disabled, or a `readonly` field read-only, when someone edits it in DevTools.

- **Package:** `@rsuthar/state-guard-js` (v1.1.0, MIT)
- **Runtime:** browsers (needs `MutationObserver` and `window`)
- **Size:** one file, [src/StateGuard.js](../../src/StateGuard.js), about 60 lines

> **Important:** StateGuard makes casual tampering harder. It is not an access-control mechanism. Anything running in the page, including the DevTools console, can call `StateGuard.update()` or replace the element. Always enforce permissions on the server. See [Security Model](Security-Model).

## Repository map

| Path | What it is |
|---|---|
| `src/StateGuard.js` | Core library: an IIFE that exposes the global `StateGuard` (also CommonJS) |
| `src/useStateGuard.js` | React hook adapter (see [Known Issues](Known-Issues): currently non-functional) |
| `src/state-guard.dir.ts` | Angular directive adapter (see [Known Issues](Known-Issues): currently non-functional) |
| `server/violation-logger.js` | Example Express endpoint that logs tamper reports |
| `dist/state-guard.min.js` | Terser-minified build (the package `main`) |
| `dist/state-guard.obf.js` | Obfuscated build (`javascript-obfuscator --self-defending`) |
| `index.html` | Local demo page |
| `tests/tate-guard.test.js` | Jest (jsdom) test suite |
| `docs/` | GitHub Pages site and short reference pages |
| `.github/workflows/ci.yml` | CI: install, test, build, obfuscate, upload `dist/` |

## Quick links

- New here? Start with [Getting Started](Getting-Started).
- Integrating? See the [API Reference](API-Reference) and [Framework Integration](Framework-Integration).
- Contributing? See [Development](Development) and [Known Issues](Known-Issues).
