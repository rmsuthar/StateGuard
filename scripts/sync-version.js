// Copies package.json "version" into src/StateGuard.js (run by the npm "version" hook).
const fs = require('fs');
const path = require('path');

const { version } = require('../package.json');
const file = path.join(__dirname, '../src/StateGuard.js');
const src = fs.readFileSync(file, 'utf8');
const next = src.replace(/const VERSION = '[^']*';/, `const VERSION = '${version}';`);

if (next === src && !src.includes(`const VERSION = '${version}';`)) {
    console.error('sync-version: VERSION constant not found in src/StateGuard.js');
    process.exit(1);
}
fs.writeFileSync(file, next);
console.log(`sync-version: StateGuard.version = ${version}`);
