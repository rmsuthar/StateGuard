# API Reference

```js
StateGuard.protect(target, options?)  // → Guard[]
StateGuard.guard(el, options?)        // → Guard
StateGuard.update(el, fn)             // → fn's return value | undefined
StateGuard.unprotect(target)          // → number of guards removed
StateGuard.isProtected(el)            // → boolean
StateGuard.getGuard(el)               // → Guard | undefined
StateGuard.destruct()                 // → void
StateGuard.version                    // → '2.0.0'
StateGuard.Guard                      // the class (advanced; not registered when constructed directly)
```

## TypeScript

`src/StateGuard.d.ts` is referenced by `"types"` in package.json. Exported types:

| Type | Description |
|---|---|
| `GuardOptions<E>` | `{ attributes?, maxAttempts?, onViolation? }` |
| `ViolationDetail` | `{ attribute, attemptedValue, restoredValue }` |
| `ViolationHandler<E>` | `(element: E, count, detail) => void` |
| `Guard<E>` | Handle: `el`, `count` (read-only), `active`, `isGuarded`, `exec`, `resetCount`, `disconnect` |
| `AttributeList`, `Target<E>`, `GuardConstructor`, `StateGuardStatic` | Supporting types |

`E` is the element type. It is inferred from the element you pass, or from a tag-name selector (`protect('input')` gives `Guard<HTMLInputElement>[]`), and is `Element` otherwise. To narrow a selector explicitly, write `protect<HTMLButtonElement>('#pay')`.

## Options

| Option | Type | Default | Behavior |
|---|---|---|---|
| `attributes` | `string[]` \| `'all'` | `'all'` | Attributes to guard. Names are case-sensitive (`viewBox` on SVG). |
| `maxAttempts` | non-negative `number` | `3` | `onViolation` fires once `count >= maxAttempts`. |
| `onViolation` | `(el, count, detail) => void` | `null` | Called on **every** violation from the threshold onwards. If it throws, the error is logged to `console.error` and protection carries on. |

`detail = { attribute, attemptedValue, restoredValue }`. A value of `null` means the attribute is absent.

Invalid options throw `TypeError`.

## `protect(target, options?)`
`target` can be a CSS selector, an `Element`, or a `NodeList`/array of elements. The snapshot of each element's attributes is taken at this moment. Protecting an element that is already protected disconnects the old guard first, so an element never has more than one observer.

## `update(el, fn)` / `guard.exec(fn)`
1. Pauses the guard.
2. Runs `fn(el)` **synchronously**.
3. If it succeeds, re-snapshots all attributes and returns the result of `fn`.
4. If it throws, restores the previous snapshot and re-throws.
5. Throws away the mutation records it generated itself, then resumes the guard.

If `fn` returns a promise, a warning is logged, because changes made after an `await` happen outside the gateway and get reverted. `update` on an element that is not protected does nothing and does **not** call `fn`.

## `Guard` handle
| Member | Description |
|---|---|
| `exec(fn)` | As above. Throws if the guard is disconnected. |
| `disconnect()` | Stops observing and removes the guard from the registry. Idempotent. |
| `resetCount()` | Sets `count` back to 0. |
| `count` | Number of violations so far. |
| `el` | The guarded element. |

## Side effects
None. Loading the script only defines `StateGuard`. Calling `protect` with a selector when there is no `document` throws a clear error.
