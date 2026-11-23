const fs = require('fs');
const path = require('path');

// Guards against shipping a stale build: the minified bundle must expose the same API.
const MIN = path.join(__dirname, '../dist/state-guard.min.js');

(fs.existsSync(MIN) ? test : test.skip)('dist/state-guard.min.js exposes the source API', () => {
    const built = require(MIN);
    const src = require('../src/StateGuard');
    expect(Object.keys(built).sort()).toEqual(Object.keys(src).sort());
    expect(built.version).toBe(src.version);
});

test('source version matches package.json', () => {
    expect(require('../src/StateGuard').version).toBe(require('../package.json').version);
});
