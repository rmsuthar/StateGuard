const StateGuard = require('../src/StateGuard');

// MutationObserver callbacks are delivered asynchronously (microtask).
const flush = () => new Promise(r => setTimeout(r, 0));

const mount = html => {
    document.body.innerHTML = html;
    return document.body.firstElementChild;
};

afterEach(() => {
    StateGuard.destruct();
    jest.restoreAllMocks();
});

describe('reverting tampering', () => {
    test('restores a removed attribute', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'] });

        btn.removeAttribute('disabled');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(true);
    });

    test('restores a modified attribute value', async () => {
        const el = mount('<div id="d" class="locked"></div>');
        StateGuard.protect('#d', { attributes: ['class'] });

        el.className = 'unlocked admin';
        await flush();

        expect(el.className).toBe('locked');
    });

    test('removes an injected attribute in "all" mode', async () => {
        const btn = mount('<button id="b">Go</button>');
        StateGuard.protect('#b');

        btn.setAttribute('onclick', 'alert(1)');
        await flush();

        expect(btn.hasAttribute('onclick')).toBe(false);
    });

    test('removes an injected attribute that is in the guarded list', async () => {
        const btn = mount('<button id="b">Go</button>');
        StateGuard.protect('#b', { attributes: ['onclick'] });

        btn.setAttribute('onclick', 'alert(1)');
        await flush();

        expect(btn.hasAttribute('onclick')).toBe(false);
    });

    test('ignores attributes that are not guarded', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'], maxAttempts: 1, onViolation });

        btn.setAttribute('title', 'hello');
        await flush();

        expect(btn.getAttribute('title')).toBe('hello');
        expect(onViolation).not.toHaveBeenCalled();
    });

    test('a change reverted by hand before delivery is not a violation', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { maxAttempts: 1, onViolation });

        btn.removeAttribute('disabled');
        btn.setAttribute('disabled', '');
        await flush();

        expect(onViolation).not.toHaveBeenCalled();
    });

    test('works on SVG camelCase attributes', async () => {
        const svg = mount('<svg id="s" viewBox="0 0 10 10"></svg>');
        StateGuard.protect('#s', { attributes: ['viewBox'] });

        svg.setAttribute('viewBox', '0 0 99 99');
        await flush();

        expect(svg.getAttribute('viewBox')).toBe('0 0 10 10');
    });
});

describe('violation reporting', () => {
    test('one tamper produces exactly one violation (no revert loop)', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'], maxAttempts: 1, onViolation });

        btn.removeAttribute('disabled');
        await flush();
        await flush();

        expect(onViolation).toHaveBeenCalledTimes(1);
        expect(StateGuard.getGuard(btn).count).toBe(1);
    });

    test('fires once maxAttempts is reached, then on every further violation', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'], maxAttempts: 3, onViolation });

        for (let i = 0; i < 4; i++) {
            btn.removeAttribute('disabled');
            await flush();
        }

        expect(onViolation.mock.calls.map(c => c[1])).toEqual([3, 4]);
    });

    test('passes the element, the count and a detail object', async () => {
        const onViolation = jest.fn();
        const el = mount('<input id="i" value="10" readonly>');
        StateGuard.protect('#i', { attributes: ['value', 'readonly'], maxAttempts: 1, onViolation });

        el.setAttribute('value', '9999');
        await flush();

        expect(onViolation).toHaveBeenCalledWith(el, 1, {
            attribute: 'value',
            attemptedValue: '9999',
            restoredValue: '10'
        });
    });

    test('maxAttempts: 0 is honoured (not replaced by the default)', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { maxAttempts: 0, onViolation });

        btn.removeAttribute('disabled');
        await flush();

        expect(onViolation).toHaveBeenCalledTimes(1);
    });

    test('a throwing onViolation does not stop protection', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { maxAttempts: 1, onViolation: () => { throw new Error('boom'); } });

        btn.removeAttribute('disabled');
        await flush();
        btn.removeAttribute('disabled');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(true);
        expect(console.error).toHaveBeenCalledTimes(2);
    });

    test('counts are tracked per element', async () => {
        mount('<div><button class="x" disabled></button><button class="x" disabled></button></div>');
        const [a, b] = StateGuard.protect('.x', { attributes: ['disabled'] });

        a.el.removeAttribute('disabled');
        await flush();

        expect(a.count).toBe(1);
        expect(b.count).toBe(0);
    });

    test('resetCount() restarts the threshold', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        const [g] = StateGuard.protect('#b', { maxAttempts: 2, onViolation });

        btn.removeAttribute('disabled');
        await flush();
        g.resetCount();
        btn.removeAttribute('disabled');
        await flush();

        expect(onViolation).not.toHaveBeenCalled();
    });
});

describe('authorized updates', () => {
    test('changes made through update() are kept and are not violations', async () => {
        const onViolation = jest.fn();
        const btn = mount('<button id="b" disabled class="a"></button>');
        StateGuard.protect('#b', { maxAttempts: 1, onViolation });

        StateGuard.update(btn, el => {
            el.disabled = false;
            el.className = 'b';
            el.setAttribute('data-state', 'ready');
        });
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(false);
        expect(btn.className).toBe('b');
        expect(btn.dataset.state).toBe('ready');
        expect(onViolation).not.toHaveBeenCalled();
    });

    test('update() makes the new state the trusted snapshot', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'] });

        StateGuard.update(btn, el => el.removeAttribute('disabled'));
        btn.setAttribute('disabled', '');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(false);
    });

    test('update() returns the callback result', () => {
        const btn = mount('<button id="b"></button>');
        StateGuard.protect('#b');

        expect(StateGuard.update(btn, el => el.id)).toBe('b');
    });

    test('update() on an unprotected element does nothing', () => {
        const btn = mount('<button id="b"></button>');
        const fn = jest.fn();

        expect(StateGuard.update(btn, fn)).toBeUndefined();
        expect(fn).not.toHaveBeenCalled();
    });

    test('a throwing callback rolls back, re-throws, and leaves the guard active', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'] });

        expect(() => StateGuard.update(btn, el => {
            el.removeAttribute('disabled');
            throw new Error('fail');
        })).toThrow('fail');
        expect(btn.hasAttribute('disabled')).toBe(true);

        btn.removeAttribute('disabled');
        await flush();
        expect(btn.hasAttribute('disabled')).toBe(true);
    });

    test('warns when the callback is async', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const btn = mount('<button id="b"></button>');
        StateGuard.protect('#b');

        StateGuard.update(btn, async () => {});

        expect(console.warn).toHaveBeenCalled();
    });

    test('onViolation may call update() safely', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', {
            maxAttempts: 1,
            onViolation: el => StateGuard.update(el, e => e.setAttribute('data-flagged', 'true'))
        });

        btn.removeAttribute('disabled');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(true);
        expect(btn.dataset.flagged).toBe('true');
    });
});

describe('lifecycle & registry', () => {
    test('protecting an element twice keeps a single observer', async () => {
        const first = jest.fn();
        const second = jest.fn();
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { maxAttempts: 1, onViolation: first });
        StateGuard.protect('#b', { maxAttempts: 1, onViolation: second });

        btn.removeAttribute('disabled');
        await flush();

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    test('protect() accepts an Element or a NodeList and returns guards', () => {
        mount('<div><i class="x"></i><i class="x"></i></div>');
        const one = StateGuard.protect(document.querySelector('.x'));
        const all = StateGuard.protect(document.querySelectorAll('.x'));

        expect(one).toHaveLength(1);
        expect(all).toHaveLength(2);
        expect(all[0]).toBeInstanceOf(StateGuard.Guard);
    });

    test('guard() returns a handle whose disconnect() stops protection', async () => {
        const btn = mount('<button disabled></button>');
        const g = StateGuard.guard(btn, { attributes: ['disabled'] });
        expect(StateGuard.isProtected(btn)).toBe(true);

        g.disconnect();
        btn.removeAttribute('disabled');
        await flush();

        expect(StateGuard.isProtected(btn)).toBe(false);
        expect(btn.hasAttribute('disabled')).toBe(false);
    });

    test('unprotect() stops protection and reports how many guards it removed', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b');

        expect(StateGuard.unprotect('#b')).toBe(1);
        btn.removeAttribute('disabled');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(false);
        expect(StateGuard.unprotect('#b')).toBe(0);
    });

    test('destruct() stops all observers', async () => {
        const btn = mount('<button id="b" disabled></button>');
        StateGuard.protect('#b', { attributes: ['disabled'] });

        StateGuard.destruct();
        btn.removeAttribute('disabled');
        await flush();

        expect(btn.hasAttribute('disabled')).toBe(false);
        expect(StateGuard.isProtected(btn)).toBe(false);
    });

    test('updating through a disconnected guard throws', () => {
        const g = StateGuard.guard(mount('<button></button>'));
        g.disconnect();
        expect(() => g.exec(() => {})).toThrow(/disconnected/);
    });
});

describe('options validation & environment', () => {
    test('protect() works without options', () => {
        mount('<button id="b"></button>');
        expect(() => StateGuard.protect('#b')).not.toThrow();
    });

    test.each([
        [{ attributes: 'disabled' }, /attributes/],
        [{ attributes: [1] }, /attributes/],
        [{ maxAttempts: -1 }, /maxAttempts/],
        [{ onViolation: 'nope' }, /onViolation/]
    ])('rejects invalid options %p', (opts, msg) => {
        mount('<button id="b"></button>');
        expect(() => StateGuard.protect('#b', opts)).toThrow(msg);
    });

    test('rejects invalid targets', () => {
        expect(() => StateGuard.protect(42)).toThrow(TypeError);
        expect(() => StateGuard.guard(null)).toThrow(TypeError);
    });

    test('does not patch console.clear', () => {
        expect(String(console.clear)).not.toMatch(/disabled for security/);
    });

    test('exposes a version string', () => {
        expect(StateGuard.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
