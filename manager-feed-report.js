/* Read-only manager/feed/tank breakdown. Never modifies delivery data. */
(()=>{"use strict";
const $=id=>document.getElementById(id), customer=$("mfrCustomer"),manager=$("mfrManager"),tank=$("mfrTank"),period=$("mfrPeriod"),date=$("mfrDate"),button=$("mfrRun"),status=$("mfrStatus"),out=$("mfrResults");
if(!button)return;
const today=new Date();date.value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,"0"),String(today.getDate()).padStart(2,"0")].join("-");
let directory=null,assignments=null,seq=0;
const opt=(el,value,label)=>{const o=document.createElement("option");o.value=value;o.textContent=label;el.appendChild(o);};
const txt=(tag,text,parent)=>{const el=document.createElement(tag);el.textContent=text;parent.appendChild(el);return el;};
const cents=x=>Math.round(Number(x)*100);
const fmt=n=>(n/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
function activeManager(farmId,day){const a=assignments.assignments.filter(x=>x.farm_id===farmId&&x.effective_from<=day&&(!x.effective_to||x.effective_to>=day)).sort((a,b)=>b.effective_from.localeCompare(a.effective_from))[0];return a?.manager_id||"";}
function populate(){const old=manager.value;manager.replaceChildren();opt(manager,"","All Managers — Combined");for(const m of assignments.managers.filter(x=>x.active!==false))opt(manager,m.id,m.name);manager.value=[...manager.options].some(o=>o.value===old)?old:"";populateTanks();}
function populateTanks(){const old=tank.value;tank.replaceChildren();opt(tank,"","All Ponds — Combined");const eligible=directory.tanks.filter(t=>!manager.value||activeManager(t.farm_id,date.value)===manager.value);for(const t of eligible){const f=directory.farms.find(f=>f.id===t.farm_id);opt(tank,t.id,(f?.name||"Farm")+" — "+t.tank_label);}tank.value=[...tank.options].some(o=>o.value===old)?old:"";}
async function initialize(){try{if(!CKCloud.isSignedIn())return;const [customers,dir,mgr]=await Promise.all([CKCloud.listCustomers(),CKCloud.listFarmsAndTanks(),CKCloud.listManagersAndAssignments()]);directory=dir;assignments=mgr;customer.replaceChildren();for(const c of customers)opt(customer,c.id,c.name);populate();status.textContent="Ready. Select a customer and view feed totals.";}catch(e){status.textContent="Report setup unavailable: "+e.message;}}
function dates(){const d=new Date(date.value+"T12:00:00");if(!/^\d{4}-\d{2}-\d{2}$/.test(date.value)||!Number.isFinite(d.getTime())||iso(d)!==date.value)throw Error("Choose a valid date.");let a=new Date(d),b=new Date(d);if(period.value==="week"){a.setDate(a.getDate()-(a.getDay()+6)%7);b=new Date(a);b.setDate(b.getDate()+7);}else if(period.value==="month"){a.setDate(1);b=new Date(a);b.setMonth(b.getMonth()+1);}else if(period.value==="year"){a.setMonth(0,1);b=new Date(a);b.setFullYear(b.getFullYear()+1);}else b.setDate(b.getDate()+1);return [iso(a),iso(b)];}
for(const el of [customer,manager,tank,period,date])el.addEventListener("change",()=>{seq++;out.replaceChildren();status.textContent="Selection changed. View feed totals.";if(el===manager||el===date){if(directory&&assignments)populateTanks();}});
button.addEventListener("click",async()=>{const n=++seq;button.disabled=true;out.replaceChildren();status.textContent="Calculating feed totals…";
try{if(!CKCloud.isSignedIn()||!directory||!assignments)throw Error("Sign in and load the report first.");if(!customer.value)throw Error("Select a customer.");
const [start,end]=dates();
const all=await CKCloud.listTicketsForPeriod(start,end),tickets=all.filter(t=>t.is_test!==true&&t.customer_id===customer.value&&(period.value!=="week"||new Date(t.delivery_date+"T12:00:00").getDay()!==0));
const allocations=await CKCloud.listReportTankAllocations(tickets.map(t=>t.id));if(n!==seq)return;
const byTicket=new Map(tickets.map(t=>[t.id,t])),byTank=new Map(directory.tanks.map(t=>[t.id,t])),byManager=new Map(assignments.managers.map(m=>[m.id,m.name]));
const allocated=new Map(),grouped=new Map();let missingType=0,unknownManager=0;
for(const a of allocations){const t=byTicket.get(a.ticket_id),k=byTank.get(a.tank_id),v=cents(a.tons);if(!t||!k||!Number.isFinite(v)||v<=0)continue;allocated.set(t.id,(allocated.get(t.id)||0)+v);const mid=activeManager(k.farm_id,t.delivery_date);if(!mid){unknownManager++;continue;}if(manager.value&&mid!==manager.value)continue;if(tank.value&&k.id!==tank.value)continue;
const type=String(t.feed_type||"").trim()||"Feed type not recorded";if(type==="Feed type not recorded")missingType++;
const key=type.toLowerCase(),g=grouped.get(key)||{type,tons:0,ids:new Set(),managers:new Map()};g.tons+=v;g.ids.add(t.id);
const m=g.managers.get(mid)||{name:byManager.get(mid)||"Unknown manager",tons:0,ids:new Set(),tanks:new Map()};m.tons+=v;m.ids.add(t.id);
const tk=m.tanks.get(k.id)||{name:(directory.farms.find(f=>f.id===k.farm_id)?.name||"Farm")+" — "+k.tank_label,tons:0,ids:new Set()};tk.tons+=v;tk.ids.add(t.id);m.tanks.set(k.id,tk);g.managers.set(mid,m);grouped.set(key,g);}
let sum=0,ids=new Set();for(const g of grouped.values()){sum+=g.tons;for(const id of g.ids)ids.add(id);}
txt("h3",ids.size+" loads · "+fmt(sum)+" tons",out);
txt("p","Verified allocated feed only · "+start+" through "+end+" (end exclusive)",out);
for(const g of [...grouped.values()].sort((a,b)=>b.tons-a.tons)){const box=document.createElement("section");box.style.cssText="padding:12px 0;border-top:1px solid #b5c5d1";out.appendChild(box);const title=txt("h3",g.type+" — "+g.ids.size+" loads · "+fmt(g.tons)+" tons",box);title.style.fontSize="17px";
for(const m of [...g.managers.values()].sort((a,b)=>a.name.localeCompare(b.name))){const detail=document.createElement("details");detail.style.cssText="margin:8px 0;padding:8px;background:#fff;border-radius:8px";box.appendChild(detail);const summary=document.createElement("summary");summary.textContent=m.name+" — "+m.ids.size+" loads · "+fmt(m.tons)+" tons";summary.style.cssText="cursor:pointer;font-weight:700";detail.appendChild(summary);for(const k of [...m.tanks.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true})))txt("p",k.name+" — "+k.ids.size+" loads · "+fmt(k.tons)+" tons",detail);}}
const problems=tickets.filter(t=>allocated.get(t.id)!==cents(t.tons));if(problems.length)txt("p","Attention: "+problems.length+" tickets have missing or incomplete tank assignments; their unassigned tons are NOT included above.",out);
if(unknownManager)txt("p","Attention: "+unknownManager+" allocations lack a manager assignment for their delivery date.",out);
if(missingType)txt("p","Attention: some tickets have no recorded feed type.",out);
if(!grouped.size)txt("p","No verified allocations match this selection.",out);
status.textContent="Report ready. Original tickets and photos unchanged.";
}catch(e){if(n===seq)status.textContent="Report unavailable: "+e.message;}finally{if(n===seq)button.disabled=false;}
});
$("logout").addEventListener("click",()=>{seq++;directory=null;assignments=null;customer.replaceChildren();out.replaceChildren();status.textContent="Sign in to view reports.";});
document.addEventListener("click",()=>{if(CKCloud.isSignedIn()&&!directory)initialize();},{capture:true});
if(CKCloud.isSignedIn())initialize();
})();