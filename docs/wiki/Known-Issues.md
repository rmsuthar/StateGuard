# Known Issues

## Resolved in the unreleased version

The 2026-11-23 code review found the following problems in v1.1.0. All of them have been fixed, and the ones that can be tested in jsdom have regression tests. See [CHANGELOG](https://github.com/rmsuthar/StateGuard/blob/main/CHANGELOG.md).

| # | Issue | Fix |
|---|---|---|
| 1 | One tamper caused an endless revert loop (1,001 callbacks in testing) | Compare with the snapshot, plus `takeRecords()` |
| 2 | React and Angular adapters always threw (`Guard` not exported) | `guard()` API; adapters rewritten |
| 3 | A throwing `update()` callback disabled protection for good | `try/finally`, with rollback |
| 4 | Authorized updates counted as violations | `takeRecords()` in `exec` |
| 5 | Global `console.clear` override; crashed on SSR import | Removed; UMD wrapper does no DOM access at load time |
| 6 | Duplicate `protect()` leaked observers | Existing guard is disconnected first |
| 7 | `"module"` pointed at a non-ESM file | Field removed |
| 8 | React hook recreated the guard every render | Stable dependency key, plus a ref for the callback |
| 9 | `maxAttempts: 0` became 3; `protect()` without options threw | `??`-style default; options are optional |
| 10 | Server log injection, trusted client fields, no limits | JSON lines, validation, rate limit, body limit |
| 11 | CI on the retired `upload-artifact@v3`; release tagged a stale `dist/` | Actions v4; npm `version` hook |
| 12 | Committed `.env` and `.DS_Store`; leftover AI text and outdated examples in the docs | Removed; README rewritten |

## Still open

- **No adapter tests.** Testing the React hook and Angular directive needs React/Angular test tooling as devDependencies.
- **Strong registry references.** Guarded elements that are removed from the DOM stay in memory until you call `unprotect()`.
- **No subtree or text protection.** Only the element's own attributes are guarded.
- **Framework re-renders** of guarded attributes count as tampering. This is by design and documented in [Framework Integration](Framework-Integration).
- **No ESM build.** Bundlers use CommonJS interop. A native `.mjs` build plus an `exports` map would make tree-shaking and type definitions cleaner.
- **No TypeScript declarations** (`.d.ts`) for the core.
