# Known Issues (code review, v1.1.0)

Findings from a review of the code on 2026-11-23. Items marked **verified** were reproduced with Jest and jsdom.

## High

### 1. One tamper starts an endless revert loop (verified)
`revert()` calls `setAttribute`, and that queues a new mutation record even when the value is unchanged. The observer handles the new record as another violation: `count++`, revert, a new record, and so on, without end. In testing, a single `removeAttribute('disabled')` produced **1,001** `onViolation` calls before the test's safety valve called `destruct()`. In a browser this is a microtask loop that can freeze the tab.
**Fix:** skip records whose current value already matches the snapshot, and/or call `obs.takeRecords()` right after reverting:
```js
const cur = this.el.getAttribute(name);
if (cur === (this.snap[name] ?? null)) return; // nothing to revert, not a violation
```

### 2. React and Angular adapters always throw (verified)
Both call `new StateGuard.Guard(...)`, but `Guard` is not exported (`typeof StateGuard.Guard === 'undefined'`). Export it, or add a public `StateGuard.guard(element, options)` that returns a handle with `update()` and `disconnect()`.

### 3. A throwing `update()` callback turns protection off for good (verified)
`exec()` has no `try/finally`, so `locked` stays `true` and every later tamper is ignored.
```js
exec(fn) { this.locked = true; try { fn(this.el); } finally { this.save(); this.locked = false; } }
```

## Medium

4. **Authorized updates can count as violations.** `locked` is cleared before the asynchronous observer runs, so `update()` mutations increment `count`. In testing, one `update()` fired `onViolation` once when `maxAttempts: 1`. Fix: call `this.obs.takeRecords()` at the end of `exec()` to throw away its own records.
5. **`onViolation` fires on every violation once the threshold is reached,** and `count` never resets. Document this as intended behavior, or fire once and reset.
6. **Global `console.clear` override** on load. This is a surprising side effect, and it breaks SSR and Node imports (`window` is undefined). Remove it, or make it opt-in.
7. **Duplicate `protect()` leaks observers,** and removed elements are never released (the registry is a strong `Map`). Disconnect any existing guard before replacing it. Consider an `unprotect(el)` method.
8. **Package `"module"` points at a non-ESM file.** Ship a real ESM build or drop the field.
9. **React hook re-creates the guard on every render** because `options` is in the effect's dependency list. The hook also never imports `StateGuard`.

## Low

10. `maxAttempts: 0` silently becomes `3` (`||` instead of `??`).
11. `protect()` without `options` throws. Default it to `{}`.
12. Example server: log injection, trusts client fields, no validation or rate limiting, and `express` is not a dependency. See [Violation Reporting Server](Violation-Reporting-Server).
13. CI uses the retired `upload-artifact@v3`. See [Development](Development).
14. Docs drift: `elementRef` vs `elRef`, a non-existent Angular `(violation)` output, the `/log-tamper` vs `/violation` route mismatch, the self-defending "debugger loop" claim, and the "100ms" test claim.
15. Test coverage covers only `destruct()`, and the test file name has a typo (`tate-guard`).
