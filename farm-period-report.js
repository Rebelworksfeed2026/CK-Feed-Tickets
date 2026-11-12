/* Read-only monthly/yearly verified allocation report. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const button=$("farmPeriodButton");if(!button)return;
const status=$("farmPeriodStatus"),output=$("farmPeriodResults");
const dateInput=$("farmPeriodDate");
const today=new Date();
dateInput.value=today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");
let sequence=0;
function table(title,headers,rows){
 const p=document.createElement("p");p.textContent=title;p.style.fontWeight="700";output.appendChild(p);
 const t=document.createElement("table");t.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
 const head=document.createElement("tr");
 for(const h of headers){const th=document.createElement("th");th.textContent=h;th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";head.appendChild(th);}
 t.appendChild(head);
 for(const values of rows){const tr=document.createElement("tr");for(const v of values){const td=document.createElement("td");td.textContent=String(v);td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";tr.appendChild(td);}t.appendChild(tr);}
 if(!rows.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=headers.length;td.textContent="No matching records";tr.appendChild(td);t.appendChild(tr);}
 output.appendChild(t);
}
for(const control of [$("farmPeriod"),dateInput,$("cloudWeek")])control.addEventListener("change",()=>{sequence++;output.replaceChildren();status.textContent="Selection changed. Calculate again.";});
$("logout").addEventListener("click",()=>{sequence++;output.replaceChildren();status.textContent="Sign in to view reports.";});
button.addEventListener("click",async()=>{
 const token=++sequence;button.disabled=true;output.replaceChildren();status.textContent="Calculating verified totals…";
 try{
  if(!CKCloud.isSignedIn())throw Error("Sign in first.");
  const date=dateInput.value,period=$("farmPeriod").value;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!["day","month","year"].includes(period))throw Error("Choose a valid date and period.");
  const parsed=new Date(date+"T12:00:00");
  if(Number.isNaN(parsed.getTime())||parsed.getFullYear()!==Number(date.slice(0,4))||parsed.getMonth()+1!==Number(date.slice(5,7))||parsed.getDate()!==Number(date.slice(8,10)))throw Error("Choose a real calendar date.");
  const start=period==="day"?date:period==="year"?date.slice(0,4)+"-01-01":date.slice(0,7)+"-01";
  const y=Number(date.slice(0,4)),m=Number(date.slice(5,7));
  const nextDay=new Date(date+"T12:00:00");nextDay.setDate(nextDay.getDate()+1);
  const dayEnd=nextDay.getFullYear()+"-"+String(nextDay.getMonth()+1).padStart(2,"0")+"-"+String(nextDay.getDate()).padStart(2,"0");
  const end=period==="day"?dayEnd:period==="year"?(y+1)+"-01-01":(m===12?(y+1)+"-01-01":y+"-"+String(m+1).padStart(2,"0")+"-01");
  const [tickets,drivers,directory]=await Promise.all([CKCloud.listTicketsForPeriod(start,end),CKCloud.listDrivers(),CKCloud.listFarmsAndTanks()]);
  if(token!==sequence||!CKCloud.isSignedIn())return;
  const allocations=await CKCloud.listReportTankAllocations(tickets.map(t=>t.id));
  if(token!==sequence||!CKCloud.isSignedIn())return;
  const byTicket=new Map(tickets.map(t=>[t.id,t]));
  const farms=new Map(directory.farms.map(f=>[f.id,f.name]));
  const tanks=new Map(directory.tanks.map(t=>[t.id,t]));
  const names=new Map(drivers.map(d=>[d.id,d.name]));
  const totals=new Map(),details=new Map(),allocated=new Map();
  for(const a of allocations){
   const ticket=byTicket.get(a.ticket_id),tank=tanks.get(a.tank_id);
   const cents=Math.round(Number(a.tons)*100);
   if(!ticket||!tank||!Number.isFinite(cents)||cents<=0)continue;
   allocated.set(ticket.id,(allocated.get(ticket.id)||0)+cents);
   const farm=farms.get(tank.farm_id)||"Unknown farm";
   const key=tank.farm_id+"|"+tank.id;
   const item=totals.get(key)||{farm,tank:tank.tank_label,cents:0,tickets:new Set()};
   item.cents+=cents;item.tickets.add(ticket.id);totals.set(key,item);
   const driver=names.get(ticket.driver_id)||"Unknown driver";
   const detailKey=key+"|"+ticket.driver_id;
   const detail=details.get(detailKey)||{farm,tank:tank.tank_label,driver,cents:0,tickets:new Set()};
   detail.cents+=cents;detail.tickets.add(ticket.id);details.set(detailKey,detail);
  }
  const ticketCents=tickets.reduce((n,t)=>n+Math.round(Number(t.tons)*100),0);
  const allocatedCents=[...allocated.values()].reduce((a,b)=>a+b,0);
  const problems=tickets.filter(t=>allocated.get(t.id)!==Math.round(Number(t.tons)*100));
  const p=document.createElement("p");p.textContent=(period==="year"?"Year":period==="month"?"Month":"Day")+" starting "+start+": "+tickets.length+" tickets, "+(ticketCents/100).toFixed(2)+" total tons; "+(allocatedCents/100).toFixed(2)+" assigned tons.";output.appendChild(p);
  const farmTotals=new Map();
  for(const entry of totals.values()){
   const farm=farmTotals.get(entry.farm)||{farm:entry.farm,cents:0,tickets:new Set()};
   farm.cents+=entry.cents;
   for(const id of entry.tickets)farm.tickets.add(id);
   farmTotals.set(entry.farm,farm);
  }
  table("Verified farm totals — all ponds",["Farm","Unique tickets","Tons"],[...farmTotals.values()].sort((a,b)=>a.farm.localeCompare(b.farm)).map(x=>[x.farm,x.tickets.size,(x.cents/100).toFixed(2)]));
  table("Verified totals by farm and pond",["Farm","Pond","Tickets","Tons"],[...totals.values()].sort((a,b)=>a.farm.localeCompare(b.farm)||a.tank.localeCompare(b.tank,undefined,{numeric:true})).map(x=>[x.farm,x.tank,x.tickets.size,(x.cents/100).toFixed(2)]));
  table("Verified totals by driver, farm and pond",["Farm","Pond","Driver","Tickets","Tons"],[...details.values()].sort((a,b)=>a.farm.localeCompare(b.farm)||a.tank.localeCompare(b.tank,undefined,{numeric:true})||a.driver.localeCompare(b.driver)).map(x=>[x.farm,x.tank,x.driver,x.tickets.size,(x.cents/100).toFixed(2)]));
  table("Tickets requiring allocation review",["Ticket","Destination","Ticket tons","Assigned tons"],problems.map(t=>[t.ticket_number,t.destination,Number(t.tons).toFixed(2),((allocated.get(t.id)||0)/100).toFixed(2)]));
  status.textContent="Report calculated. All original tickets and photos unchanged.";
 }catch(e){if(token===sequence)status.textContent="Report unavailable: "+e.message;}
 finally{if(token===sequence)button.disabled=false;}
});
})();