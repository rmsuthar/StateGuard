# Changelog

## Unreleased

### Fixed
- **Infinite revert loop:** a single tamper no longer re-triggers the observer forever. Before this fix, one change could fire `onViolation` hundreds of times and freeze the tab.
- **React hook and Angular directive** now work. They previously called an unexported `StateGuard.Guard` and always threw.
- If an `update()` callback throws, protection no longer stays disabled. The changes are rolled back and the error is re-thrown.
- Authorized `update()` changes are no longer counted as violations.
- Protecting the same element twice no longer leaks a second observer.
- `maxAttempts: 0` is now honored instead of silently becoming `3`.
- A throwing `onViolation` callback no longer interrupts reverting.
- `window.StateGuard` is now actually set when the library is loaded as a plain `<script>` (UMD wrapper).
- The React hook no longer recreates the guard on every render.

### Changed
- **Breaking:** the library no longer overrides `console.clear` globally.
- **Breaking:** invalid options (a non-array `attributes`, a negative `maxAttempts`, a non-function `onViolation`) now throw `TypeError` instead of misbehaving.
- `onViolation` now receives a third argument, `detail`: `{ attribute, attemptedValue, restoredValue }`.
- `protect()` now accepts an `Element` or a `NodeList` as well as a selector, and returns the created guards. `options` is optional.
- Removed the package `"module"` field, which pointed at a non-ESM file.
- The library can now be imported in Node and during SSR without a DOM.
- The Angular directive is `standalone` and adds a `maxAttempts` input and a `(violation)` output.
- Example server: JSON-lines logging (prevents log injection), input validation, per-IP rate limiting, a 4 KB body limit, and server-side timestamps.
- CI: actions v4, a Node 18/20/22 matrix, `npm ci`, pull-request runs, and a check for a stale `dist/`.
- Release: `dist/` is rebuilt and committed together with the version bump through the npm `version` hook.

### Added
- `StateGuard.guard(el, opts)`, `unprotect(target)`, `isProtected(el)`, `getGuard(el)`, `version`, and the exported `Guard` class with `disconnect()` and `resetCount()`.
- Test suite: 38 tests covering reverting, the revert-loop regression, thresholds, updates, rollback, lifecycle, validation, the Node environment, and dist/version consistency.
