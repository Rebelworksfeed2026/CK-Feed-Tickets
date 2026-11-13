/* Run with: node feed-recognition.test.js
   Tests only the feed-name matching rules; no account or ticket data is accessed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {}, document: undefined };
vm.runInNewContext(fs.readFileSync(__dirname + '/feed-recognition.js','utf8'), context);
const inspect = context.window.CKFeedRecognition.inspect;
const cases = [
  ['DW 28 Spec Iron','28 Special'],
  ['28 Special Iron','28 Special'],
  ['FRY 2','FRY 2'],
  ['FRY-2','FRY 2'],
  ['Mini Pellets','Mini Pellets'],
  ['MINI PELLET','Mini Pellets'],
  ['Dust/Fines','Dust/Fines'],
  ['Dust Fine','Dust/Fines'],
  ['UNRECOGNIZED PRODUCT',null]
];
for (const [input, expected] of cases) {
  const actual = inspect(input).type;
  assert.equal(actual, expected, input + ' should map to ' + expected);
}
process.stdout.write('PASS: ' + cases.length + ' feed-description cases\\n');
