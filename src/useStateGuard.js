import { useEffect, useRef } from 'react';
export const useStateGuard = (options = {}) => {
    const elRef = useRef(null);
    const gRef = useRef(null);
    useEffect(() => {
        if (elRef.current) gRef.current = new StateGuard.Guard(elRef.current, options);
        return () => gRef.current?.obs.disconnect();
    }, [options]);
    return { elRef, safeUpdate: (fn) => gRef.current?.exec(fn) };
};