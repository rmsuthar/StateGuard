---
title: StateGuard.js
description: Stop users from messing with your UI logic via the console.
tags: [StateGuard.js, Security, JavaScript, Web Development]
---
<style>
.markdown-body h1:first-child:not(.show-title) {
    display: none;
}
</style>

# 🛡️ StateGuard.js

GitHub: [StateGuard.js](https://github.com/ravindrasuthar/state-guard-js)


> Stop users from messing with your UI logic via the console.

StateGuard.js is a lightweight utility that locks DOM element attributes. If a user tries to remove a `disabled` attribute, change a `class`, or inject an `onclick` event via DevTools, StateGuard detects it and reverts the change in milliseconds.

## 🚀 Key Features

* **Zero-Latency Reversion:** Uses `MutationObserver` for near-instant attribute restoration.
* **Security Thresholds:** Detects and reports repeated tampering attempts.
* **Multi-Framework Support:** Specialized hooks for React and Directives for Angular.
* **Small Footprint:** Under 2KB minified.

---

## 🛠️ Integration Guide

### Vanilla JavaScript

Protect any element using standard CSS selectors.

```javascript
StateGuard.protect('.restricted-action', {
  attributes: ['disabled', 'readonly', 'data-id'],
  maxAttempts: 5,
  onViolation: (el, count) => reportToBackend(el, count)
});

```

### React (Using Hooks)

The hook manages the lifecycle of the observer and ensures it cleans up when the component unmounts.

```javascript
const { elementRef, safeUpdate } = useStateGuard({ attributes: ['class'] });

// Use safeUpdate to modify the element without triggering the guard
const handleUnlock = () => {
  safeUpdate((el) => el.classList.remove('locked'));
};

```

### Angular (Using Directives)

Apply protection declaratively in your templates.

```html
<button appStateGuard [protectedAttributes]="['disabled']" (violation)="logIt($event)">
  Secure Action
</button>

```

---

## 🔒 Security Hardening Tips

1. **Run the Obfuscator:** Always run `npm run obfuscate` before deploying. This makes it incredibly difficult for attackers to find the "unlock" logic in your source code.
2. **The Debugger Loop:** Our production build includes a self-defending loop that triggers a `debugger` statement if DevTools are opened while the script is running.
3. **Backend Verification:**
* **Level 1:** StateGuard prevents the button from being enabled.
* **Level 2:** Your server verifies if the user actually has the permissions to perform the action associated with that button. **Never trust the client alone.**



---

## 🧪 Testing the Guard

To verify that the protection is active, run the included Jest suite:

```bash
npm test

```

This suite simulates a user attempting to delete attributes via the console and confirms the library restores them within the 100ms threshold.

---

### **Next Steps for You**

1. **Initialize the project:** Run `npm init -y` in your folder and paste the `package.json` content.
2. **Install dependencies:** Run `npm install`.
3. **Build:** Run `npm run build` to generate your minified file.

Would you like me to help you write a **sample GitHub Action script** so that this library is automatically tested and obfuscated every time you push code to your repository?