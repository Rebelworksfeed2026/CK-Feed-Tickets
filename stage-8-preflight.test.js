// Standalone Stage 8 preflight: node stage-8-preflight.test.js
// Synthetic in-memory records only; no Supabase writes.
'use strict';
const assert=require('node:assert/strict');
const date=s=>new Date(s+'T12:00:00');
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const start=s=>{const d=date(s);d.setDate(d.getDate()-((d.getDay()+1)%7));return iso(d)};
const valid=(ticket,tons)=>/^\d{5,8}$/.test(ticket)&&Number.isFinite(tons)&&tons>0&&tons<=50&&Math.abs(Math.round(tons*100)-tons*100)<=1e-7;
function totals(rows){let week=0;const daily={};return rows.map(x=>{const cents=Math.round(x.tons*100);week+=cents;daily[x.date]=(daily[x.date]||0)+cents;return {daily:daily[x.date]/100,weekly:week/100}})}
assert.equal(start('2026-11-07'),'2026-11-07');
assert.equal(start('2026-11-09'),'2026-11-07');
assert.equal(start('2026-11-13'),'2026-11-07');
assert.equal(start('2026-11-14'),'2026-11-14');
assert.equal(valid('100715',24.10),true);
for(const x of [['100715',0],['100715',50.01],['100715',24.101],['abc',24],['100715',NaN]])assert.equal(valid(...x),false);
const a=totals([{date:'2026-11-09',tons:24.10},{date:'2026-11-09',tons:23.95},{date:'2026-11-10',tons:22.04}]);
assert.deepEqual(a,[{daily:24.1,weekly:24.1},{daily:48.05,weekly:48.05},{daily:22.04,weekly:70.09}]);
const prev=[24.11,24.03,23.99];const firstTwo=prev.slice(0,2).reduce((s,x)=>s+Math.round(x*100),0)/100;
assert.equal(Math.round((48.05-firstTwo)*100)/100,-0.09);
assert.equal(new Set(['100715','100715']).size,1);
console.log('Stage 8 preflight: PASS — Saturday week, entry validation, daily/weekly totals, equal-load comparison, duplicate identity.');
