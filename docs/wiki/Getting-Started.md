# Getting Started

## Install

```bash
npm install @rsuthar/state-guard-js
```

Or load it from a CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@rsuthar/state-guard-js/dist/state-guard.min.js"></script>
```

The build is UMD. A plain `<script>` defines `window.StateGuard`. Under CommonJS or a bundler, `require`/`import` return the same object, and it is safe to import during SSR.

## Protect an element

```html
<button id="pay" disabled>Pay</button>
<script>
  StateGuard.protect('#pay', {
    attributes: ['disabled', 'class'],
    maxAttempts: 3,
    onViolation: (el, count, detail) => console.warn('Tampering on', el.id, count, detail)
  });
</script>
```

Removing `disabled` in DevTools now puts it straight back.

## Change a protected element from your own code

Make the change inside `StateGuard.update`, so the new state becomes the trusted snapshot. If the callback throws, the change is rolled back.

```js
StateGuard.update(document.getElementById('pay'), el => {
  el.disabled = false;
});
```

If you set the attribute directly (`btn.disabled = false`), StateGuard treats it as tampering and reverts it.

## Try the demo

Open `index.html` in a browser (serve the repo root so `src/StateGuard.js` resolves), then try removing `disabled` from the button in DevTools.
