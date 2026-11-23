/**
 * @jest-environment node
 */
// The library must be importable during SSR / in Node without a DOM.
test('loads without window or document', () => {
    expect(typeof window).toBe('undefined');
    const StateGuard = require('../src/StateGuard');
    expect(typeof StateGuard.protect).toBe('function');
    expect(() => StateGuard.protect('#x')).toThrow(/document is not available/);
});
