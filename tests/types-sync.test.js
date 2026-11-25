const fs = require('fs');
const path = require('path');

// Keeps src/StateGuard.d.ts in step with the runtime API. (Type correctness
// itself is checked by `npm run test:types`.)
const dts = fs.readFileSync(path.join(__dirname, '../src/StateGuard.d.ts'), 'utf8');
const StateGuard = require('../src/StateGuard');

function membersOf(interfaceName) {
    const start = dts.indexOf(`interface ${interfaceName}`);
    if (start < 0) throw new Error(`interface ${interfaceName} not found in StateGuard.d.ts`);
    let depth = 0;
    let i = dts.indexOf('{', start);
    const open = i;
    for (; i < dts.length; i++) {
        if (dts[i] === '{') depth++;
        else if (dts[i] === '}' && --depth === 0) break;
    }
    const body = dts.slice(open + 1, i).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    // Top-level member names: "name(" "name<" "name:" "name?:" at nesting depth 0.
    const names = new Set();
    let d = 0;
    for (const line of body.split('\n')) {
        if (d === 0) {
            const m = line.match(/^\s*(?:readonly\s+)?([A-Za-z_$][\w$]*)\??\s*[(<:]/);
            if (m) names.add(m[1]);
        }
        for (const ch of line) {
            if ('({['.includes(ch)) d++;
            else if (')}]'.includes(ch)) d--;
        }
    }
    return [...names].sort();
}

test('StateGuardStatic declares exactly the runtime exports', () => {
    expect(membersOf('StateGuardStatic')).toEqual(Object.keys(StateGuard).sort());
});

test('every declared Guard member exists at runtime', () => {
    document.body.innerHTML = '<button></button>';
    const g = StateGuard.guard(document.body.firstElementChild);
    for (const name of membersOf('Guard<')) {
        expect(name in g).toBe(true);
    }
    StateGuard.destruct();
});

test('package.json points "types" at a published file', () => {
    const pkg = require('../package.json');
    expect(pkg.types).toBe('src/StateGuard.d.ts');
    expect(fs.existsSync(path.join(__dirname, '..', pkg.types))).toBe(true);
    expect(pkg.files).toContain('src');
});
