# Getting Started

## Install

```bash
npm install @rsuthar/state-guard-js
```

Or load it from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@rsuthar/state-guard-js/dist/state-guard.min.js"></script>
```

The script defines a global `StateGuard`. In a CommonJS environment, `require('@rsuthar/state-guard-js')` returns the same object.

> The package's `"module"` field points to `src/StateGuard.js`, but that file is not an ES module (it has no `export`). `import StateGuard from '@rsuthar/state-guard-js'` may fail or return `undefined`, depending on your bundler. Until that is fixed, use the global or `require`. See [Known Issues](Known-Issues).

## Protect an element

```html
<button id="pay" disabled>Pay</button>
<script>
  StateGuard.protect('#pay', {
    attributes: ['disabled', 'class'],
    maxAttempts: 3,
    onViolation: (el, count) => console.warn('Tampering on', el.id, count)
  });
</script>
```

Removing `disabled` in DevTools now puts it straight back.

## Change a protected element from your own code

Make the change inside `StateGuard.update`, so the new state becomes the trusted snapshot:

```js
StateGuard.update(document.getElementById('pay'), el => {
  el.disabled = false;
});
```

If you set the attribute directly (`btn.disabled = false`), StateGuard treats it as tampering and reverts it.

## Try the demo

Open `index.html` in a browser (serve the repo root so `src/StateGuard.js` resolves), then try removing `disabled` from the button in DevTools.
