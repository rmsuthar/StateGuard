# Framework Integration

Both adapters are thin wrappers around `StateGuard.guard()` and use only `exec()` and `disconnect()`.

## React: `useStateGuard(options)` ([src/useStateGuard.js](https://github.com/rmsuthar/StateGuard/blob/main/src/useStateGuard.js))

```jsx
import { useStateGuard } from '@rsuthar/state-guard-js/src/useStateGuard.js';

function PayButton({ onTamper }) {
  const { elRef, safeUpdate } = useStateGuard({
    attributes: ['disabled'],
    maxAttempts: 2,
    onViolation: (el, count, detail) => onTamper(detail)
  });
  return <button ref={elRef} disabled>Pay</button>;
}
// safeUpdate(el => el.removeAttribute('disabled'));
```

- The guard is created after mount and disconnected on unmount.
- It is recreated **only** when the *contents* of `attributes` or the value of `maxAttempts` change, so inline option objects are fine.
- `onViolation` is read through a ref, so the latest callback is always used without recreating the guard.
- `safeUpdate` keeps the same identity across renders. It returns `undefined` before mount.
- **Who owns the attributes:** if React re-renders a guarded attribute (for example `disabled={state}`), that change happens outside the gateway and gets reverted. Either leave guarded attributes out of JSX, or change them with `safeUpdate`.
- The hook imports `./StateGuard.js`, which is CommonJS. Webpack, Vite and similar bundlers handle that interop automatically.

## Angular: `StateGuardDirective` ([src/state-guard.dir.ts](https://github.com/rmsuthar/StateGuard/blob/main/src/state-guard.dir.ts))

1. Load the core as a global in `angular.json`:
   ```json
   "scripts": ["node_modules/@rsuthar/state-guard-js/dist/state-guard.min.js"]
   ```
2. Import the standalone directive in your component's `imports` array.

```html
<button appStateGuard #g="stateGuard"
        [protectedAttributes]="['disabled']" [maxAttempts]="3"
        (violation)="onTamper($event)">Pay</button>
```

```ts
onTamper(v: StateGuardViolation) { /* v.element, v.count, v.attribute, v.attemptedValue, v.restoredValue */ }
unlock() { this.g.update(el => el.removeAttribute('disabled')); }
```

- Inputs are read once, in `ngOnInit`.
- If the global script is missing, the directive throws an error that explains how to add it.
- The same ownership rule applies as for React: don't bind guarded attributes with `[disabled]`. Change them through `update()`.

## Testing note
The repository has no React or Angular toolchain, so the adapters have no automated tests. The core APIs they depend on (`guard`, `exec`, `disconnect`, the `onViolation` detail) are covered by `tests/state-guard.test.js`.
