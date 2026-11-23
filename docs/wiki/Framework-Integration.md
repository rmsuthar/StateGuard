# Framework Integration

> ⚠️ **Status:** neither adapter works in v1.1.0. Both call `StateGuard.Guard`, which the core library does not export, so they throw `TypeError: StateGuard.Guard is not a constructor`. Use the [workaround](#workaround-until-fixed) below until they are fixed.

## React: `useStateGuard(options)` ([src/useStateGuard.js](../../src/useStateGuard.js))

Intended usage:

```jsx
const { elRef, safeUpdate } = useStateGuard({ attributes: ['class'] });
return <button ref={elRef} className="locked">Go</button>;
// later: safeUpdate(el => el.classList.remove('locked'));
```

Note that the hook returns `elRef`. The README's example uses `elementRef`, which is wrong.

Other issues in the hook:
- It relies on a global `StateGuard` but never imports it.
- `options` is listed in the `useEffect` dependencies. An inline object (or the default `{}`) is a new object on every render, so the guard is torn down and recreated each render, and every recreation re-snapshots whatever state the element is in, including tampered state.
- It logs to `console.log` on every unmount.

## Angular: `StateGuardDirective` ([src/state-guard.dir.ts](../../src/state-guard.dir.ts))

Intended usage:

```html
<button appStateGuard #g="stateGuard" [protectedAttributes]="['disabled']">Go</button>
<!-- in code: g.update(el => el.removeAttribute('disabled')) -->
```

- Its only input is `protectedAttributes`. It does **not** have the `(violation)` output shown in the README, and it has no `maxAttempts` or `onViolation`.
- It reads `window.StateGuard.Guard`, which is undefined (see above).
- It is not part of any NgModule, and it is not declared `standalone`.

## Workaround until fixed

Use the public API directly:

```jsx
useEffect(() => {
  const el = ref.current;
  el.id ||= 'sg-' + Math.random().toString(36).slice(2);
  StateGuard.protect('#' + el.id, opts);
  return () => StateGuard.destruct(); // note: tears down ALL guards
}, []);
```
