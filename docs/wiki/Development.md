# Development & Release

## Scripts

| Command | What it does |
|---|---|
| `npm test` | Jest. Core suite in jsdom, plus a Node-environment suite and dist checks |
| `npm run build` | `terser` → `dist/state-guard.min.js` (keeps the `/*!` license banner) |
| `npm run obfuscate` | `javascript-obfuscator --self-defending` → `dist/state-guard.obf.js` |
| `npm run test:types` | `tsc` over `tests/types/`, which checks the `.d.ts` against real usage and `@ts-expect-error` cases |
| `npm run release` | `npm test && npm run test:types && npm version minor` |
| `version` (npm hook) | Runs inside `npm version`: `scripts/sync-version.js` → build → obfuscate → `git add src/StateGuard.js dist` |

Because the rebuild happens in the `version` hook, the release commit and tag contain the matching `dist/` and the matching `StateGuard.version`.

`--self-defending` makes the obfuscated code stop working if it is reformatted. It does **not** add an anti-debugger loop (that is `--debug-protection`).

## Tests

| File | Covers |
|---|---|
| `tests/state-guard.test.js` | Reverting (removed, modified, injected and SVG attributes), the revert-loop regression, thresholds and the `detail` payload, `maxAttempts: 0`, throwing callbacks, `update()` (keep, return value, rollback, async warning, re-entrancy from `onViolation`), single observer per element, `guard`/`unprotect`/`destruct`, option validation, no `console.clear` patch |
| `tests/node-env.test.js` | The module loads with no `window` or `document` |
| `tests/types-sync.test.js` | Members of `StateGuardStatic` and `Guard` in the `.d.ts` match the runtime API; `"types"` points at a published file |
| `tests/types/*.ts` | Compile-time type tests (module import and UMD global). Run by `npm run test:types`, not Jest |
| `tests/dist.test.js` | `dist/state-guard.min.js` exposes the same API and version as the source. The source version equals `package.json` |

MutationObserver delivery is asynchronous, so tests `await` a `setTimeout(0)` flush after each mutation.

## CI

`.github/workflows/ci.yml` runs on push and on pull requests across Node 18, 20 and 22:
`npm ci` → build → obfuscate → test → test:types. On Node 20 it also fails the job if the committed `dist/state-guard.min.js` differs from a fresh build, and uploads `dist/` as an artifact. (The obfuscated file is randomized on every build, so the check skips it.)
