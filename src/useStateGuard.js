import { useEffect, useRef } from 'react';

export const useStateGuard = (options = {}) => {
    const elRef = useRef(null);
    const guardInstance = useRef(null);

    useEffect(() => {
        if (elRef.current) {
            // Initialize the guard
            guardInstance.current = new StateGuard.Guard(elRef.current, options);
        }

        // CLEANUP FUNCTION: This stops the observer
        return () => {
            if (guardInstance.current && guardInstance.current.obs) {
                guardInstance.current.obs.disconnect();
                console.log('[StateGuard] Observer disconnected for component unmount');
            }
        };
    }, [options]);

    return {
        elRef,
        safeUpdate: (fn) => guardInstance.current?.exec(fn)
    };
};