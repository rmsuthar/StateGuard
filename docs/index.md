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

GitHub: [StateGuard.js](https://github.com/ravindrasuthar/state-guard-js)


> Stop users from messing with your UI logic via the console.

StateGuard.js is a lightweight utility that locks DOM element attributes. If a user tries to remove a `disabled` attribute, change a `class`, or inject an `onclick` event via DevTools, StateGuard detects it and reverts the change in milliseconds.

## 🚀 Key Features

* **Zero-Latency Reversion:** Uses `MutationObserver` for near-instant attribute restoration.
* **Security Thresholds:** Detects and reports repeated tampering attempts.
* **Multi-Framework Support:** Specialized hooks for React and Directives for Angular.
* **Small Footprint:** Under 2KB minified.

---

### Core Concepts
Snapshotting: The library takes a "Source of Truth" snapshot of an element's attributes upon initialization.

**The Guard:** A MutationObserver watches the element 24/7. If an attribute is changed manually, it is instantly reverted to the snapshot.

**Programmatic Gateway:** Authorized changes must pass through the .update() method, which temporarily unlocks the element and updates the snapshot.

**Installation**
Include the obfuscated or minified version of StateGuard.js at the bottom of your **HTML body:**

```html
<script src="js/state-guard.min.js"></script>
```


### API Reference
StateGuard.protect(selector, options)
Initializes protection on one or more elements.

|Property|Type|Default|Description|
|---|---|---|---|
|selector|string|Required|"CSS selector (e.g., #btn, .admin-fields)."|
|attributes|array or string,'all',"List of attributes to protect (e.g., ['class', 'disabled'])."|
|maxAttempts|number,3,Number of manual changes allowed before triggering a violation.|
|onViolation|function,null,Callback executed when maxAttempts is reached.|

**Key Features**

* Persistent State: Automatically reverts any unauthorized attribute changes.
* Threshold Alerts: Triggers security callbacks after a set number of tamper attempts.
* Framework Agnostic: Works with Vanilla JS, React, and Angular.
* Backend Sync: Built-in hooks to report "Hacker" behavior to your servers.

**Installation**

```bash
# Add to your project
npm install state-guard-js # (Hypothetical)
```


## 🛠️ Integration Guide

### Vanilla JavaScript

Protect any element using standard CSS selectors.

```javascript
StateGuard.protect('.secure-action', {
    attributes: ['disabled', 'class', 'onclick'],
    maxAttempts: 3,
    onViolation: (el, count) => {
        console.error("Reporting tamper attempt to server...");
        
        // Send the report to your backend
        fetch('/api/security/log-tamper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                elementId: el.id || 'unnamed-element',
                elementTag: el.tagName,
                attempts: count,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        })
        .then(() => {
            if (count > 5) {
                alert("Security policy violation. This session will be terminated.");
                window.location.href = '/logout';
            }
        });
    }
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

### Release Notes

Here are the official Release Notes for your version 1.0.0 launch. You can paste these directly into the "Releases" section of your GitHub repository.

**🚀 Release v1.0.0: StateGuard.js Initial Launch
We are excited to announce the first stable release of StateGuard.js, a proactive security utility designed to harden client-side UI logic and prevent manual DOM tampering.

**🌟 Features**
* Persistent Attribute Guard: Uses MutationObserver to instantly revert unauthorized changes to disabled, class, readonly, and more.
* Framework First: Includes native support for React (hooks) and Angular (directives).
* Security Thresholds: Customizable maxAttempts logic to detect and log repeated tampering behavior.
* Automated Pipeline: Integrated GitHub Actions for automated testing and JavaScript Obfuscation.
* Reporting Hook: Seamless onViolation callback for backend integration and audit logging.

**📦 Installation**
Download the dist/state-guard.obf.js for production.

Initialize with StateGuard.protect(selector, options).

🛡️ Best Practices for this Version
Obfuscate always: Never use the src/ files in a public production environment.

Update Gateway: Always use the .update() or safeUpdate methods to modify protected elements programmatically to avoid "infinite revert" loops.

### **Next Steps for You**

1. **Initialize the project:** Run `npm init -y` in your folder and paste the `package.json` content.
2. **Install dependencies:** Run `npm install`.
3. **Build:** Run `npm run build` to generate your minified file.

Would you like me to help you write a **sample GitHub Action script** so that this library is automatically tested and obfuscated every time you push code to your repository?