# How It Works

## Lifecycle

```
protect(target, opts) / guard(el, opts)
  └─ existing guard for el? → disconnect it
  └─ new Guard(el, opts)
        ├─ save():   snap = Map{ attrName → value }   (all attributes)
        └─ watch():  MutationObserver(el, { attributes: true, attributeFilter? })

Someone edits an attribute
  └─ observer callback (microtask)
        ├─ locked or disconnected → ignore
        ├─ for each guarded attribute in the batch (once per name):
        │     if el.getAttribute(name) === snapshot value → skip (not a violation)
        │     revert(name); count++; notify(detail) if count >= limit
        └─ obs.takeRecords()   ← discard the records our own reverts produced

update(el, fn)
  └─ locked = true
     try   fn(el) → save()              (success: adopt the new state)
     catch restore() → rethrow          (failure: roll back)
     finally obs.takeRecords(); locked = false
```

## Why there is no revert loop

`setAttribute` queues a mutation record even when the value doesn't change. Version 1.1.0 treated those records as fresh tampering, which caused an endless loop. Two independent safeguards now prevent it:

1. **Compare against the snapshot.** A record counts as a violation only if the attribute's *current* value differs from the snapshot. Records from a revert, or from a change that was undone before the observer ran, are skipped.
2. **`takeRecords()`.** After processing a batch, and at the end of every `update()`, the guard empties its observer's queue. Mutations it made itself are never delivered back to it.

The second safeguard also stops authorized updates from being counted. The `locked` flag on its own cannot do that, because observer callbacks run after `update()` has already returned.

## Scope
- Only the element's own attributes are observed: no subtree, text or child changes. A replacement node (`outerHTML`, `replaceWith`) is not guarded.
- When `attributes` is a list, the observer uses `attributeFilter`, so unrelated attribute changes are never delivered.
- The registry is a `Map` that holds strong references. Call `unprotect()` or `disconnect()` when you remove guarded elements.

## Module format
The source is wrapped in UMD. If CommonJS is present (Node, Jest, bundlers), it uses `module.exports`. Otherwise it sets `globalThis.StateGuard`. Nothing touches the DOM at load time, so the module is safe to import during SSR.
