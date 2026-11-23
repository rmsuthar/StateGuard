# How It Works

## Lifecycle

```
protect(selector, opts)
  └─ for each matched element → new Guard(el, opts)
        ├─ save():   snap = { attrName: value, ... }   (all attributes)
        └─ watch():  MutationObserver(el, { attributes: true })

Someone edits an attribute
  └─ observer callback (microtask)
        ├─ if locked → ignore whole batch
        └─ for each record whose attributeName is guarded:
              count++
              revert(name)   → setAttribute(snap[name]) or removeAttribute(name)
              if onViolation && count >= limit → onViolation(el, count)

update(el, fn)
  └─ locked = true → fn(el) → save() → locked = false
```

## Key design points

- **Snapshot.** Every attribute is recorded, even when only some are guarded. A guarded attribute that was absent at snapshot time is removed again if someone adds it, so injected `onclick` attributes get stripped.
- **Scope.** Only attributes on the element itself are observed: no `subtree`, `childList` or `characterData`. Changes to text content, children, or a replacement node (`outerHTML`, `replaceWith`) are not detected.
- **Registry.** A `Map` that holds a strong reference to each element. If a guarded element is removed from the DOM, it stays in memory and its observer stays connected until `destruct()` is called.

## The `locked` flag and asynchronous observers

`MutationObserver` callbacks run asynchronously, as a microtask after the current script finishes. `update()` sets and clears `locked` synchronously, so by the time the callback runs, `locked` is back to `false`. The flag never actually suppresses anything. Authorized updates stay in place only because `save()` has already re-snapshotted, so the revert writes the new value back (or removes an attribute that is already gone). This has two side effects:

1. An authorized update can still increment `count` and fire `onViolation`.
2. If the record's attribute is still present, the revert calls `setAttribute`. That queues **another** mutation record, which is reverted again, and so on. See the revert loop in [Known Issues](Known-Issues).
