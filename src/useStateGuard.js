import { useCallback, useEffect, useRef } from 'react';
import StateGuard from './StateGuard.js';

/**
 * React hook that guards the attributes of the element attached to `elRef`.
 *
 *   const { elRef, safeUpdate } = useStateGuard({ attributes: ['disabled'] });
 *   <button ref={elRef} disabled>Pay</button>
 *   safeUpdate(el => el.removeAttribute('disabled'));
 *
 * The guard is only re-created when `attributes` or `maxAttempts` change;
 * inline option objects and inline `onViolation` callbacks are safe.
 */
export function useStateGuard(options = {}) {
    const elRef = useRef(null);
    const guardRef = useRef(null);
    const onViolationRef = useRef(options.onViolation);
    onViolationRef.current = options.onViolation;

    // Stable dependency key for the attribute list (arrays are new every render).
    const attributesKey = options.attributes == null ? '"all"' : JSON.stringify(options.attributes);
    const { maxAttempts } = options;

    useEffect(() => {
        const el = elRef.current;
        if (!el) return undefined;

        const guard = StateGuard.guard(el, {
            attributes: JSON.parse(attributesKey),
            maxAttempts,
            onViolation: (...args) => {
                if (onViolationRef.current) onViolationRef.current(...args);
            }
        });
        guardRef.current = guard;

        return () => {
            guard.disconnect();
            if (guardRef.current === guard) guardRef.current = null;
        };
    }, [attributesKey, maxAttempts]);

    /** Authorized change. Returns fn's result, or undefined before mount. */
    const safeUpdate = useCallback(fn => (guardRef.current ? guardRef.current.exec(fn) : undefined), []);

    return { elRef, safeUpdate };
}

export default useStateGuard;
