/* Run with: node tests.cjs — Node is only needed by maintainers, not for the demo. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = require('./data.js');
const total = rows => rows.reduce((sum, row) => sum + row.qty, 0);

assert.equal(data.query(data.defaults).length, 5);
assert.equal(total(data.query(data.defaults)), 2033);
assert.equal(data.query({ mpn: '  epm240t100c5n ' }).length, 5);
assert.equal(data.query({ warehouse: 'other' }).length, 0);
assert.equal(total(data.query({}, { hold: 'Yes' })), 1033);
assert.equal(data.query({ split: 'Yes' })[0].qty, 223);
assert.equal(total(data.query({ subinventory: 'YKK-JB' }, { supplierLot: 'mj2' })), 181);
assert.equal(total(data.query({ receivedFrom: '2026-02-25', receivedTo: '2026-02-25' })), 270);
assert.equal(data.query({ receivedFrom: '2026-10-01' }).length, 0);
assert.equal(total(data.query({ standardDateCodeFrom: '2601', standardDateCodeTo: '2601' })), 810);
assert.equal(data.query({ locatorFrom: 'GS.A07.7.B10', locatorTo: 'GS.A07.7.B10' }).length, 1);
assert.equal(data.query({ poNumber: '260200' }).length, 2);
assert.equal(data.query({ asnNumber: 'ASN2601001', receiptNumber: 'RCV2601001', productLine: 'Altera' }).length, 1);
assert.equal(data.query({}, { receivedDate: 'Feb 2026' }).length, 2);
assert.deepEqual(data.query({}, {}, { key: 'qty', direction: 1 }).map(r => r.qty), [89, 181, 223, 540, 1000]);
assert.equal(data.query({}, {}, { key: 'receivedDate', direction: -1 })[0].receivedDate, '2026-08-03');
assert.equal(data.records[0].qty, 1000, 'Sorting must not mutate source records');
assert.equal(data.validate({ receivedFrom: '2026-03-01', receivedTo: '2026-02-01' }).field, 'receivedTo');
assert.equal(data.validate({ locatorFrom: 'Z', locatorTo: 'A' }).field, 'locatorTo');
assert.equal(data.validate({ standardDateCodeFrom: '2601', standardDateCodeTo: '2505' }).field, 'standardDateCodeTo');
assert.equal(data.validate({ receivedFrom: '2026-02-25', receivedTo: '2026-02-25' }), null);
const visible = data.columns.filter(c => ['mpn', 'qty'].includes(c.key));
const csv = data.csv(data.query({}, { hold: 'Yes' }, { key: 'qty', direction: 1 }), visible);
assert.ok(csv.startsWith('\uFEFF"MPN","Qty"\r\n'));
assert.equal(csv.split('\r\n').length, 5);
assert.ok(csv.endsWith('"EPM240T100C5N","540"'));
assert.ok(data.csv([{ mpn: '=1+1', qty: 2 }], visible).includes('"\'=1+1"'));
assert.ok(data.csv([{ mpn: 'a"b,c', qty: 2 }], visible).includes('"a""b,c"'));
assert.equal(data.csv([], visible), '\uFEFF"MPN","Qty"');
for (const name of ['index.html', 'styles.css', 'data.js', 'app.js', 'assets/favicon.svg', 'assets/login-reference.png', 'assets/home-reference.png']) {
  assert.ok(fs.existsSync(path.join(__dirname, name)), `Missing offline asset: ${name}`);
}
const source = ['index.html', 'styles.css', 'app.js', 'data.js'].map(name => fs.readFileSync(path.join(__dirname, name), 'utf8')).join('\n');
assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bimport\s*\(|type=["']module|https?:\/\//.test(source), 'Offline demo must not require HTTP, fetch, or ES modules');
const styles = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
for (const theme of ['teal', 'cobalt', 'slate-dark']) {
  assert.ok(styles.includes(`:root[data-theme="${theme}"]`), `Missing ${theme} theme tokens`);
}
assert.match(styles, /--primary:\s*#1d5bbf/, 'Cobalt theme must use the reference blue primary');
assert.match(styles, /--bg-canvas:\s*#0b131e/, 'Slate theme must use the reference dark canvas');
assert.match(source, /id="theme-select"/, 'Theme selector must be accessible by label');
assert.match(source, /wms-demo-theme/, 'Theme preference must be persisted');
assert.match(source, /Storage may be disabled for local files/, 'Theme persistence must tolerate blocked storage');
console.log('Passed: fixtures, combined filtering, inclusive ranges, sorting, CSV, offline dependencies and theme coverage.');
