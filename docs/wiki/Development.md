# Development & Release

## Scripts

| Command | What it does |
|---|---|
| `npm test` | Jest with jsdom (`--forceExit --detectOpenHandles`) |
| `npm run build` | `terser src/StateGuard.js` → `dist/state-guard.min.js` |
| `npm run obfuscate` | `javascript-obfuscator` → `dist/state-guard.obf.js` (self-defending) |
| `npm run release` | test → `npm version minor` (commits and tags) → build → obfuscate |

`npm version` makes its commit and tag **before** the build runs, so the tagged commit contains the previous `dist/`. The rebuilt `dist/` has to be committed separately (the history shows "Update obfuscated StateGuard distribution" commits for this). Building before bumping, or using a `version` lifecycle script that runs `git add dist`, fixes this.

## Tests

`tests/tate-guard.test.js` (note the typo in the file name) has a single test, which checks that `destruct()` stops reverting. The core behavior has no tests yet: reverting, thresholds, `update()`, `'all'` mode. The README's claim that the suite "confirms the library restores them within the 100ms threshold" is not yet true.

Suggested additions:
- A tampered attribute is reverted, and `onViolation` fires exactly once per tamper.
- `update()` changes are kept and do not count as violations.
- `update()` with a throwing callback leaves the guard active.
- Elements matched more than once and `maxAttempts: 0` behave as intended.

## CI

`.github/workflows/ci.yml` runs on every push. It uses `actions/checkout@v3` and `actions/upload-artifact@v3`. GitHub has retired artifact actions v3, so jobs that use it now fail. Upgrade to `@v4` for both, and consider `npm ci` with `actions/setup-node`.

## Housekeeping

- `.env` is committed, but it contains ignore-file patterns, not environment variables. It looks like it was meant to be part of `.gitignore`. Merge it in and delete the file, so nobody later puts real secrets in a tracked `.env`.
- `.DS_Store` is committed even though `.gitignore` lists it. Run `git rm --cached .DS_Store`.
- The README and `docs/index.md` contain leftover AI-assistant text ("Here are the official Release Notes for your version 1.0.0...", "Would you like me to help you write..."). Remove it.
