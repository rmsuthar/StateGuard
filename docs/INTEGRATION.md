# Integration

## React
`import { useStateGuard } from '@rsuthar/state-guard-js/src/useStateGuard.js'`. Attach `elRef` to your JSX element and change guarded attributes only through `safeUpdate`.

## Angular
Load `dist/state-guard.min.js` through `"scripts"` in `angular.json`, then import the standalone `StateGuardDirective`. Export it in your template with `#guard="stateGuard"` to reach `update()`, and listen to `(violation)` for reports.

Details are in the [wiki](wiki/Framework-Integration.md).
