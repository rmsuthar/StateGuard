# 🛡️ StateGuard.js

![npm version](https://img.shields.io/npm/v/@rsuthar/state-guard-js)
![license](https://img.shields.io/npm/l/@rsuthar/state-guard-js)
![npm downloads](https://img.shields.io/npm/dm/@rsuthar/state-guard-js)

Website: [StateGuard.js](https://rmsuthar.github.io/StateGuard/)

> Stop users from messing with your UI logic via the console.

StateGuard.js locks DOM element attributes. If someone removes a `disabled` attribute, changes a `class`, or injects an `onclick` through DevTools, StateGuard reverts the change straight away and can report it.

> **StateGuard is UX hardening, not access control.** Code running in the page, including the DevTools console, can still call the public API or replace the element. **Always authorize actions on the server.**

## Features

* **Instant reversion:** a `MutationObserver` puts unauthorized attribute changes back.
* **Tamper reporting:** `onViolation(el, count, detail)` fires once a threshold is reached.
* **Authorized-change gateway:** `update()` applies your own changes atomically. If the callback throws, the changes roll back.
* **React hook and Angular directive** included.
* **Small:** about 1.7 KB gzipped, with no dependencies. Safe to import during SSR.

## Installation

```bash
npm install @rsuthar/state-guard-js     # or: yarn add / pnpm add
```

```html
<script src="https://cdn.jsdelivr.net/npm/@rsuthar/state-guard-js/dist/state-guard.min.js"></script>
```

The build is UMD: it defines a `StateGuard` global in a plain `<script>`, and `require` / `import` work under CommonJS and bundlers.

## Quick start

```html
<button id="pay" disabled>Pay</button>
<script>
  StateGuard.protect('#pay', {
    attributes: ['disabled', 'class'],
    maxAttempts: 3,
    onViolation: (el, count, detail) => {
      console.warn(`Tamper #${count} on ${detail.attribute}`, detail);
    }
  });

  // Later, from your own code:
  StateGuard.update(document.getElementById('pay'), el => { el.disabled = false; });
</script>
```

Changes made outside `update()`, even by your own code, count as tampering and get reverted.

## API

### `StateGuard.protect(target, options?) → Guard[]`
Protects every element matched by `target`, which can be a CSS selector, an `Element`, or a `NodeList`/array. Protecting an element that is already protected replaces its guard.

| Option | Type | Default | Description |
|---|---|---|---|
| `attributes` | `string[]` \| `'all'` | `'all'` | Attributes to guard. Attributes that were absent at snapshot time get removed if someone adds them. |
| `maxAttempts` | `number` | `3` | Number of violations before `onViolation` starts firing. `0` and `1` both mean "from the first violation". |
| `onViolation` | `(el, count, detail) => void` | `null` | Called on every violation once `count >= maxAttempts`. `detail` is `{ attribute, attemptedValue, restoredValue }`, where `null` means the attribute is absent. |

### `StateGuard.update(el, fn) → any`
Runs `fn(el)` synchronously with the guard paused, then adopts the result as the new trusted state, and returns whatever `fn` returns. If `fn` throws, the changes are rolled back and the error is re-thrown. Does nothing on elements that are not protected.

### `StateGuard.guard(el, options?) → Guard`
Protects a single element and returns its handle:
- `guard.exec(fn)`: same as `update`
- `guard.disconnect()`
- `guard.resetCount()`
- `guard.count`

### Other methods
- `StateGuard.unprotect(target) → number`: stops guarding and returns how many guards were removed
- `StateGuard.isProtected(el)`, `StateGuard.getGuard(el)`
- `StateGuard.destruct()`: disconnects every guard
- `StateGuard.version`, `StateGuard.Guard`: the class, for advanced use

## Framework integration

### React

```jsx
import { useStateGuard } from '@rsuthar/state-guard-js/src/useStateGuard.js';

function PayButton() {
  const { elRef, safeUpdate } = useStateGuard({
    attributes: ['disabled'],
    onViolation: (el, count) => report(count)   // inline callbacks are fine
  });
  return <button ref={elRef} disabled onClick={pay}>Pay</button>;
}
// safeUpdate(el => el.removeAttribute('disabled'));
```

The guard is recreated only when `attributes` or `maxAttempts` change, and it disconnects on unmount. Let StateGuard own the guarded attributes: React re-rendering a guarded attribute counts as tampering, so make those changes with `safeUpdate`.

### Angular

Add `node_modules/@rsuthar/state-guard-js/dist/state-guard.min.js` to `"scripts"` in `angular.json`. Then import the standalone `StateGuardDirective` from `src/state-guard.dir.ts`:

```html
<button appStateGuard #g="stateGuard"
        [protectedAttributes]="['disabled']" [maxAttempts]="3"
        (violation)="onTamper($event)">Pay</button>
```

```ts
g.update(el => el.removeAttribute('disabled'));
```

## Reporting to a backend

```js
onViolation: (el, count, detail) => {
  navigator.sendBeacon('/api/security/violation', new Blob([JSON.stringify({
    elementId: el.id, elementTag: el.tagName, attribute: detail.attribute,
    attempts: count, timestamp: new Date().toISOString()
  })], { type: 'application/json' }));
}
```

[`server/violation-logger.js`](server/violation-logger.js) is an example Express endpoint (`npm install express`). It validates and rate-limits reports, and writes them as JSON lines. Treat reports as low-trust signals, since attackers can forge or suppress them.

## Limitations

- Only the element's own attributes are guarded. Text, children, and replacing the node (`outerHTML`) are not detected.
- `update()` callbacks must be synchronous.
- Guards hold a reference to their element. Call `unprotect()` or `guard.disconnect()` when you remove guarded elements.
- `dist/state-guard.obf.js` is harder to read, but its API is public like any other build. Obfuscation is not protection.

## Development

```bash
npm test             # Jest + jsdom
npm run build        # dist/state-guard.min.js
npm run obfuscate    # dist/state-guard.obf.js
npm run release      # test → bump minor → sync version → rebuild dist → commit & tag
```

See [CHANGELOG.md](CHANGELOG.md) and the [wiki](docs/wiki/Home.md).

## License

MIT © Ravindra M Suthar
