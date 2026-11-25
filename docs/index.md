---
title: StateGuard.js
description: Stop users from messing with your UI logic via the console.
tags: [StateGuard.js, Security, JavaScript, Web Development]
---
<style>
  :root {
    --primary: #0066cc;
    --primary-hover: #0052a3;
    --bg-section: #f8fafc;
    --text-main: #2d3748;
    --badge-bg: #fff4e6;
    --badge-text: #663c00;
    --badge-border: #ffe1b3;
    --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --card-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  body {
    line-height: 1.6;
    color: var(--text-main);
    background-color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .markdown-body {
    animation: fadeIn 0.8s ease-out;
  }

  .markdown-body > * {
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* Staggered item entrance */
  .markdown-body > *:nth-child(1) { animation-delay: 0.1s; }
  .markdown-body > *:nth-child(2) { animation-delay: 0.15s; }
  .markdown-body > *:nth-child(3) { animation-delay: 0.2s; }
  .markdown-body > *:nth-child(4) { animation-delay: 0.25s; }
  .markdown-body > *:nth-child(5) { animation-delay: 0.3s; }
  .markdown-body > *:nth-child(n+6) { animation-delay: 0.35s; }

  .markdown-body h1:first-child:not(.show-title) {
      display: none;
  }
</style>

# 🛡️ StateGuard.js

![npm version](https://img.shields.io/npm/v/@rsuthar/state-guard-js)
![license](https://img.shields.io/npm/l/@rsuthar/state-guard-js)
![npm downloads](https://img.shields.io/npm/dm/@rsuthar/state-guard-js)

GitHub: [StateGuard.js](https://github.com/rmsuthar/StateGuard)

> Stop users from messing with your UI logic via the console.

StateGuard.js locks DOM element attributes. If someone removes a `disabled` attribute, changes a `class`, or injects an `onclick` through DevTools, StateGuard reverts the change straight away and can report it.

> **StateGuard is UX hardening, not access control.** Code running in the page, including the DevTools console, can still call the public API or replace the element. **Always authorize actions on the server.**

## Features

* **Instant reversion:** a `MutationObserver` puts unauthorized attribute changes back.
* **Tamper reporting:** `onViolation(el, count, detail)` fires once a threshold is reached.
* **Authorized-change gateway:** `update()` applies your own changes atomically. If the callback throws, the changes roll back.
* **React hook and Angular directive** included.
* **TypeScript definitions** included.
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

## TypeScript

Type definitions ship with the package (`src/StateGuard.d.ts`), so you don't need an `@types` package.

```ts
import StateGuard from '@rsuthar/state-guard-js';            // esModuleInterop
import type { Guard, GuardOptions, ViolationDetail } from '@rsuthar/state-guard-js';

const [pay] = StateGuard.protect('button', {                    // Guard<HTMLButtonElement>[]
  attributes: ['disabled'],
  onViolation: (el, count, detail: ViolationDetail) => report(el.id, detail)
});
const enabled = StateGuard.update(pay.el, el => { el.disabled = false; return true; }); // boolean | undefined
```

Tag-name selectors such as `'button'` narrow the element type, the same way `querySelectorAll` does. With a plain `<script>` tag, the `StateGuard` global is typed as well.

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

[`server/violation-logger.js`](https://github.com/rmsuthar/StateGuard/blob/main/server/violation-logger.js) is an example Express endpoint (`npm install express`). It validates and rate-limits reports, and writes them as JSON lines. Treat reports as low-trust signals, since attackers can forge or suppress them.

## Limitations

- Only the element's own attributes are guarded. Text, children, and replacing the node (`outerHTML`) are not detected.
- `update()` callbacks must be synchronous.
- Guards hold a reference to their element. Call `unprotect()` or `guard.disconnect()` when you remove guarded elements.
- `dist/state-guard.obf.js` is harder to read, but its API is public like any other build. Obfuscation is not protection.

## Development

```bash
npm test             # Jest + jsdom
npm run test:types   # type-check the .d.ts against usage tests
npm run build        # dist/state-guard.min.js
npm run obfuscate    # dist/state-guard.obf.js
npm run release      # test → bump minor → sync version → rebuild dist → commit & tag
```

See [CHANGELOG.md](https://github.com/rmsuthar/StateGuard/blob/main/CHANGELOG.md) and the [wiki](wiki/Home.md).

## License

MIT © Ravindra M Suthar
