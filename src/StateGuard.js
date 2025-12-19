const StateGuard = (function () {
    const registry = new Map();
    class Guard {
        constructor(el, opt) {
            this.el = el;
            this.attrs = opt.attributes || 'all';
            this.limit = opt.maxAttempts || 3;
            this.callback = opt.onViolation || null;
            this.snap = {};
            this.count = 0;
            this.locked = false;
            this.save();
            this.watch();
        }
        save() {
            this.snap = {};
            Array.from(this.el.attributes).forEach(a => this.snap[a.name] = a.value);
        }
        watch() {
            this.obs = new MutationObserver(recs => {
                if (this.locked) return;
                recs.forEach(r => {
                    if (this.attrs === 'all' || this.attrs.includes(r.attributeName)) {
                        this.count++;
                        this.revert(r.attributeName);
                        if (this.callback && this.count >= this.limit) this.callback(this.el, this.count);
                    }
                });
            });
            this.obs.observe(this.el, { attributes: true });
        }
        revert(name) {
            this.snap[name] !== undefined ? this.el.setAttribute(name, this.snap[name]) : this.el.removeAttribute(name);
        }
        exec(fn) {
            this.locked = true;
            fn(this.el);
            this.save();
            this.locked = false;
        }
    }

    window.console.clear = () => {
        console.warn("Console clearing is disabled for security auditing.");
    };

    return {
        protect: (sel, opt) => document.querySelectorAll(sel).forEach(e => registry.set(e, new Guard(e, opt))),
        update: (el, fn) => registry.get(el)?.exec(fn),
        Guard // Exported for adapters
    };
})();