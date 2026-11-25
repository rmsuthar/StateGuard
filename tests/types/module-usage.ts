// Compile-time tests for src/StateGuard.d.ts (run: npm run test:types).
// Lines marked @ts-expect-error MUST fail to type-check, otherwise tsc errors.
import StateGuard from '../../src/StateGuard';
import type { Guard, GuardOptions, ViolationDetail } from '../../src/StateGuard';
import SG = require('../../src/StateGuard');

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const assertType = <T extends true>() => {};

// Both import styles resolve to the same API.
assertType<Equals<typeof StateGuard, typeof SG>>();

// ── protect ────────────────────────────────────────────────────────────────
const guards = StateGuard.protect('#pay', {
    attributes: ['disabled', 'class'],
    maxAttempts: 3,
    onViolation: (el, count, detail) => {
        assertType<Equals<typeof el, Element>>();
        assertType<Equals<typeof count, number>>();
        assertType<Equals<typeof detail, ViolationDetail>>();
        assertType<Equals<typeof detail.attemptedValue, string | null>>();
    }
});
assertType<Equals<typeof guards, Guard<Element>[]>>();

// Tag-name selectors narrow the element type (like querySelectorAll).
const buttons = StateGuard.protect('button', { onViolation: el => el.disabled });
assertType<Equals<typeof buttons, Guard<HTMLButtonElement>[]>>();

// Element, NodeList, array, no options.
const btn = document.querySelector('button')!;
StateGuard.protect(btn);
StateGuard.protect(document.querySelectorAll('input'));
StateGuard.protect([btn]);
StateGuard.protect('.x', { attributes: 'all' });
const readonlyAttrs = ['disabled'] as const;
StateGuard.protect('.x', { attributes: readonlyAttrs });

// @ts-expect-error attributes must be an array or 'all'
StateGuard.protect('#a', { attributes: 'disabled' });
// @ts-expect-error maxAttempts must be a number
StateGuard.protect('#a', { maxAttempts: '3' });
// @ts-expect-error unknown option
StateGuard.protect('#a', { attrs: ['x'] });
// @ts-expect-error target must be a selector, element or list
StateGuard.protect(42);

// ── guard handle ───────────────────────────────────────────────────────────
const g = StateGuard.guard(btn, { maxAttempts: 0 });
assertType<Equals<typeof g, Guard<HTMLButtonElement>>>();
assertType<Equals<typeof g.el, HTMLButtonElement>>();
const label = g.exec(el => el.getAttribute('title'));
assertType<Equals<typeof label, string | null>>();
g.resetCount();
g.disconnect();
const isOn: boolean = g.active && g.isGuarded('disabled');
// @ts-expect-error count is read-only; use resetCount()
g.count = 0;

// ── update / registry ──────────────────────────────────────────────────────
const n = StateGuard.update(btn, el => {
    el.disabled = false;
    return 1;
});
assertType<Equals<typeof n, number | undefined>>();
// @ts-expect-error callback receives the element's own type
StateGuard.update(btn, (el: HTMLInputElement) => el.value);

const found = StateGuard.getGuard(btn);
assertType<Equals<typeof found, Guard<HTMLButtonElement> | undefined>>();
const removed: number = StateGuard.unprotect('#pay');
const has: boolean = StateGuard.isProtected(btn);
const version: string = StateGuard.version;
StateGuard.destruct();

// ── Guard class ────────────────────────────────────────────────────────────
const direct = new StateGuard.Guard(btn, { attributes: ['disabled'] });
assertType<Equals<typeof direct, Guard<HTMLButtonElement>>>();
const maybe: unknown = guards[0];
if (maybe instanceof StateGuard.Guard) {
    maybe.disconnect();
}

// Options can be declared separately with a specific element type.
const inputOpts: GuardOptions<HTMLInputElement> = {
    onViolation: el => el.value
};
StateGuard.protect(document.querySelectorAll('input'), inputOpts);

export {};
