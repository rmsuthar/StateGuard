# API Reference

The global `StateGuard` object has three methods. The `Guard` class is internal and **not** exported.

## `StateGuard.protect(selector, options)`

Finds every element matching `selector` (`document.querySelectorAll`), creates a guard for each one and stores it in an internal registry keyed by element.

| Option | Type | Default | Behavior |
|---|---|---|---|
| `attributes` | `string[]` \| `'all'` | `'all'` | Attribute names to guard. `'all'` guards every attribute on the element. |
| `maxAttempts` | `number` | `3` | Threshold for `onViolation`. Because the code uses `opt.maxAttempts \|\| 3`, a value of `0` becomes `3`. |
| `onViolation` | `(el, count) => void` | `null` | Runs on **every** violation once `count >= maxAttempts`, not just once. `count` is never reset. |

**Returns:** `undefined`.

**Notes**
- `options` is required. Calling `protect(sel)` with no options throws `TypeError` (`opt.attributes` of `undefined`).
- The snapshot is taken when you call `protect`. Elements added to the DOM later are not guarded.
- Calling `protect` twice on the same element replaces the registry entry, but the first observer keeps running. You end up with two observers.

## `StateGuard.update(element, fn)`

The "authorized change" gateway. It pauses the guard, runs `fn(element)` synchronously, re-snapshots every attribute, then resumes the guard.

- Does nothing (returns `undefined`) if `element` is not registered.
- If `fn` throws, the guard **stays paused for good**. See [Known Issues](Known-Issues).
- `fn` must be synchronous. Changes made after an `await` happen once the guard has resumed, so they get reverted.

## `StateGuard.destruct()`

Disconnects every observer and clears the registry. Use it in tests or when tearing down a page.

## Side effects of loading the script

Loading the script **replaces `console.clear`** globally with a function that only prints a warning. This affects the whole page, including your own code and third-party code. It also requires `window`, so loading the script during server-side rendering (where `window` is undefined) throws.
