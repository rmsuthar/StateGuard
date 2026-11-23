# API Reference

| Method | Returns | Description |
|---|---|---|
| `protect(target, options?)` | `Guard[]` | Guard every element matched by a selector, Element or NodeList. |
| `guard(el, options?)` | `Guard` | Guard one element. |
| `update(el, fn)` | `fn`'s result | Authorized synchronous change. Rolls back if `fn` throws. |
| `unprotect(target)` | `number` | Stop guarding. Returns the number of guards removed. |
| `isProtected(el)` / `getGuard(el)` | `boolean` / `Guard` | Registry lookups. |
| `destruct()` | `void` | Disconnect every guard. |

Options: `attributes` (`string[]` or `'all'`, default `'all'`), `maxAttempts` (default `3`), `onViolation(el, count, { attribute, attemptedValue, restoredValue })`.

`Guard` handle: `exec(fn)`, `disconnect()`, `resetCount()`, `count`.

The full reference is in the [wiki](wiki/API-Reference.md).
