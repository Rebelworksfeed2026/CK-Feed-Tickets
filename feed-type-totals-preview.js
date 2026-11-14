/* Read-only feed type report. All types are accepted; no fixed feed list. */
(function(root){
'use strict';
function summarize(rows,{period='year',date,manager_id,farm_id,tank_id,driver_id}={}){
 if(!['day','week','month','year','all'].includes(period))throw Error('Invalid period');
 const selected=date?new Date(date+'T12:00:00'):null;
 if(period!=='all'&&(!selected||Number.isNaN(selected.getTime())))throw Error('Select a report date');
 const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const monday=d=>{const x=new Date(d);x.setDate(x.getDate()-(x.getDay()+6)%7);return iso(x)};
 const inPeriod=v=>{if(period==='all')return true;const d=new Date(v+'T12:00:00');if(Number.isNaN(d.getTime()))return false;
 if(period==='day')return iso(d)===iso(selected);
 if(period==='week')return monday(d)===monday(selected);
 if(period==='month')return d.getFullYear()===selected.getFullYear()&&d.getMonth()===selected.getMonth();
 return d.getFullYear()===selected.getFullYear();
 };
 const totals=new Map();const seen=new Set();
 for(const r of rows){
  if(!inPeriod(r.delivery_date))continue;
  if(manager_id&&String(r.manager_id)!==String(manager_id))continue;
  if(farm_id&&String(r.farm_id)!==String(farm_id))continue;
  if(tank_id&&String(r.tank_id)!==String(tank_id))continue;
  if(driver_id&&String(r.driver_id)!==String(driver_id))continue;
  const name=String(r.feed_type||'').trim().replace(/\s+/g,' ');
  const tons=Number(r.allocated_tons);
  if(!name||!Number.isFinite(tons)||tons<=0)continue;
  const key=name.toLocaleUpperCase('en-US');
  if(!totals.has(key))totals.set(key,{feed_type:name,tons:0,tickets:0});
  const item=totals.get(key);item.tons=Math.round((item.tons+tons)*100)/100;
  const ticketKey=key+'|'+r.ticket_id;
  if(!seen.has(ticketKey)){seen.add(ticketKey);item.tickets++}
 }
 return [...totals.values()].sort((a,b)=>b.tons-a.tons||a.feed_type.localeCompare(b.feed_type));
}
async function load(client,filters={}){
 if(!client||typeof client.from!=='function')throw Error('Signed-in database connection required');
 let q=client.from('feed_type_delivery_report').select('ticket_id,ticket_number,delivery_date,driver_id,feed_type,allocated_tons,tank_id,farm_id,manager_id');
 const {data,error}=await q;
 if(error)throw error;
 return summarize(data||[],filters);
}
root.CKFeedTypeTotals={summarize,load};
})(typeof globalThis!=='undefined'?globalThis:this);
