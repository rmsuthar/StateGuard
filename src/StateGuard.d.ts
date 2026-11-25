// Type definitions for @rsuthar/state-guard-js
// Project: https://github.com/rmsuthar/StateGuard

/**
 * StateGuard.js - proactive DOM attribute protection.
 *
 * Works as a CommonJS/bundler import:
 *   import StateGuard from '@rsuthar/state-guard-js';   // esModuleInterop
 *   import StateGuard = require('@rsuthar/state-guard-js');
 * and as the `StateGuard` global when loaded with a plain <script> tag.
 */
declare const StateGuard: StateGuard.StateGuardStatic;

export = StateGuard;
export as namespace StateGuard;

declare namespace StateGuard {
    /** Attribute names to guard (case-sensitive, e.g. `viewBox` on SVG), or `'all'`. */
    type AttributeList = readonly string[] | 'all';

    /** Passed to `onViolation` as its third argument. `null` means "attribute absent". */
    interface ViolationDetail {
        /** Name of the attribute that was tampered with. */
        attribute: string;
        /** Value the attacker set (`null` if they removed the attribute). */
        attemptedValue: string | null;
        /** Trusted value that was put back (`null` if the attribute was removed again). */
        restoredValue: string | null;
    }

    /**
     * Called on every violation once `count >= maxAttempts`.
     * Errors thrown here are logged and never stop protection.
     */
    type ViolationHandler<E extends Element = Element> = (
        element: E,
        count: number,
        detail: ViolationDetail
    ) => void;

    interface GuardOptions<E extends Element = Element> {
        /** Attributes to guard. @default 'all' */
        attributes?: AttributeList;
        /** Violations before `onViolation` starts firing (non-negative). @default 3 */
        maxAttempts?: number;
        /** Tamper callback. */
        onViolation?: ViolationHandler<E> | null;
    }

    /** What `protect()` / `unprotect()` accept. */
    type Target<E extends Element = Element> = string | E | ArrayLike<E>;

    /** Handle for one guarded element. */
    interface Guard<E extends Element = Element> {
        /** The guarded element. */
        readonly el: E;
        /** Number of violations so far. Use `resetCount()` to reset. */
        readonly count: number;
        /** `false` once `disconnect()` has been called. */
        readonly active: boolean;
        /** True if changes to `name` are reverted by this guard. */
        isGuarded(name: string): boolean;
        /**
         * Authorized-change gateway. Runs `fn(el)` synchronously with the guard
         * paused and adopts the result as the trusted state. If `fn` throws, the
         * changes are rolled back and the error is re-thrown.
         * @throws Error if the guard has been disconnected.
         */
        exec<R>(fn: (el: E) => R): R;
        /** Reset the violation counter to 0. */
        resetCount(): void;
        /** Stop guarding and release the element. Idempotent. */
        disconnect(): void;
    }

    interface GuardConstructor {
        /**
         * Create a guard that is **not** added to the registry (so `update()`,
         * `isProtected()` etc. won't see it). Prefer `StateGuard.guard()`.
         */
        new <E extends Element = Element>(el: E, options?: GuardOptions<E>): Guard<E>;
        readonly prototype: Guard;
    }

    interface StateGuardStatic {
        /** Library version, e.g. `'2.0.0'`. */
        readonly version: string;

        /** The Guard class (advanced use). */
        readonly Guard: GuardConstructor;

        /**
         * Protect every element matched by a selector, Element or list.
         * Re-protecting an element replaces its previous guard.
         * @returns the created guards (empty if nothing matched).
         */
        protect<K extends keyof HTMLElementTagNameMap>(
            selector: K,
            options?: GuardOptions<HTMLElementTagNameMap[K]>
        ): Array<Guard<HTMLElementTagNameMap[K]>>;
        protect<E extends Element = Element>(target: Target<E>, options?: GuardOptions<E>): Array<Guard<E>>;

        /** Protect a single element and return its guard. */
        guard<E extends Element>(el: E, options?: GuardOptions<E>): Guard<E>;

        /**
         * Make an authorized change to a protected element.
         * @returns `fn`'s result, or `undefined` (without calling `fn`) if `el` is not protected.
         */
        update<E extends Element, R>(el: E, fn: (el: E) => R): R | undefined;

        /** Stop protecting the target(s). @returns the number of guards removed. */
        unprotect(target: Target): number;

        /** True if `el` currently has a registered guard. */
        isProtected(el: Element): boolean;

        /** The registered guard for `el`, if any. */
        getGuard<E extends Element>(el: E): Guard<E> | undefined;

        /** Disconnect every registered guard. */
        destruct(): void;
    }
}
