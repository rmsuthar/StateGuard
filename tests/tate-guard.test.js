const StateGuard = require('../src/StateGuard');

describe('StateGuard Security Suite', () => {

    // Cleanup after every test to ensure Jest can exit
    afterEach(() => {
        StateGuard.destruct();
    });

    test('should stop observing after destruction', async () => {
        document.body.innerHTML = '<button id="ghost-btn" disabled></button>';
        const btn = document.getElementById('ghost-btn');

        StateGuard.protect('#ghost-btn', { attributes: ['disabled'] });

        // Kill the guard
        StateGuard.destruct();

        // Attempt a change
        btn.removeAttribute('disabled');

        // Wait a moment
        await new Promise(r => setTimeout(r, 50));

        // It should NOT have reverted because the guard is dead
        expect(btn.hasAttribute('disabled')).toBe(false);
    });
});