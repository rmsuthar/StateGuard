# Security Model & Limitations

## What StateGuard does

- Reverts attribute edits made by hand in DevTools on elements it guards.
- Lets you detect and report repeated tampering through `onViolation`.

## What it does not do

Anyone with DevTools open can bypass it in seconds:

| Bypass | How |
|---|---|
| Use the gateway | `StateGuard.update($0, el => el.disabled = false)` |
| Kill all guards | `StateGuard.destruct()` |
| Replace the node | `$0.outerHTML = $0.outerHTML.replace('disabled','')` (the new node is unguarded) |
| Skip the UI | Call the underlying API with `fetch`/`curl` |
| Disable JS / block the script | Browser settings or an extension |

Obfuscation (`dist/state-guard.obf.js`) slows down reading the code, but it does not hide the global `StateGuard` API. The README says the self-defending build triggers a `debugger` loop. That is not what `--self-defending` does: it makes the code stop working if it is reformatted. The flag for anti-debugging is `--debug-protection`.

## Guidance

1. **The server must authorize every action.** Treat StateGuard as UX hardening and a source of telemetry, never as a control.
2. Treat violation reports as low-trust signals, because attackers can forge or suppress them.
3. Be careful about automatic punishments such as forced logout. The current revert loop and the authorized-update false positive (see [Known Issues](Known-Issues)) can fire `onViolation` for legitimate users.
