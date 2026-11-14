/* Sample-only verification: no real tickets or cloud writes. */
const assert=require('node:assert/strict');
require('./feed-stage-report-test.js');
const rows=[
{tank_id:'EG309',date:'2026-01-05',feed_type:'FRY 2',tons:12},
{tank_id:'EG309',date:'2026-02-05',feed_type:'FRY 2',tons:13.5},
{tank_id:'EG309',date:'2026-03-05',feed_type:'28 Special',tons:24},
{tank_id:'EG309',date:'2026-04-05',feed_type:'28 Special',tons:22},
{tank_id:'304D',date:'2026-04-05',feed_type:'FRY 2',tons:10}
];
const out=globalThis.CKFeedStageReport.report(rows);
assert.equal(out.length,2);
const eg=out.find(x=>x.tank_id==='EG309');
assert.equal(eg.feeds['FRY 2'],25.5);
assert.equal(eg.feeds['28 SPECIAL'],46);
assert.equal(eg.total_tons,71.5);
assert.equal(eg.history.length,4);
assert.equal(out.find(x=>x.tank_id==='304D').total_tons,10);
assert.throws(()=>globalThis.CKFeedStageReport.report([{tank_id:'EG309',feed_type:'FRY 2',tons:0}]));
console.log('Feed-stage sample tests passed');
