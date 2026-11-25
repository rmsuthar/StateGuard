// A script (no import/export): StateGuard is available as a UMD global,
// as it is when loaded via <script src="state-guard.min.js">.
const globalGuards = StateGuard.protect('#secureBtn', { attributes: ['disabled'] });
const firstGuard: StateGuard.Guard | undefined = globalGuards[0];
const handler: StateGuard.ViolationHandler = (el, count, detail) => {
    console.log(el.id, count, detail.attribute);
};
StateGuard.protect('#other', { onViolation: handler });
