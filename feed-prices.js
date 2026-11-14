(()=>{"use strict";
const $=id=>document.getElementById(id),cloud=window.CKCloud;
if(!$("feedPriceTile")||!cloud)return;
const date=$("feedExpenseDate");date.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
let directory={farms:[],tanks:[]},prices=[];
const money=n=>Number(n).toLocaleString("en-US",{style:"currency",currency:"USD"});
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
function option(sel,value,label){const o=document.createElement("option");o.value=value;o.textContent=label;sel.append(o);}
function fillTanks(){const sel=$("feedExpenseTank");sel.replaceChildren();option(sel,"","All tanks");for(const t of directory.tanks.filter(t=>!$("feedExpenseFarm").value||t.farm_id===$("feedExpenseFarm").value))option(sel,t.id,t.tank_label);}
$("feedExpenseFarm").addEventListener("change",fillTanks);
async function load(){if(!cloud.isSignedIn())return;try{
prices=await cloud.listFeedPrices();const list=$("feedPriceList");list.replaceChildren();
if(!prices.length)list.textContent="No feed prices entered yet.";
for(const p of prices){const row=document.createElement("div");row.style.cssText="padding:9px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;gap:8px";
const name=document.createElement("span");name.textContent=p.feed_type;const price=document.createElement("button");price.type="button";price.className="secondary";price.textContent=p.price_per_ton==null?"Set price":money(p.price_per_ton)+"/ton";
price.addEventListener("click",()=>{$("newFeedType").value=p.feed_type;$("newFeedPrice").value=p.price_per_ton??"";});
row.append(name,price);list.append(row);}
directory=await cloud.listFarmsAndTanks();const farms=$("feedExpenseFarm");const old=farms.value;farms.replaceChildren();option(farms,"","All farms");for(const f of directory.farms)option(farms,f.id,f.name);farms.value=old;fillTanks();
const profile=await cloud.myProfile();$("saveFeedPrice").hidden=!profile?.is_admin;$("newFeedType").disabled=!profile?.is_admin;$("newFeedPrice").disabled=!profile?.is_admin;
}catch(e){$("feedPriceStatus").textContent="Unable to load prices: "+e.message;}}
$("saveFeedPrice").addEventListener("click",async()=>{const name=$("newFeedType").value.trim(),raw=$("newFeedPrice").value,price=Number(raw),status=$("feedPriceStatus");
if(!name||name.length>120||raw===""||!Number.isFinite(price)||price<0||Math.round(price*100)!==price*100){status.textContent="Enter a feed name and a valid price with no more than two decimals.";return;}
const button=$("saveFeedPrice");button.disabled=true;status.textContent="Saving…";try{await cloud.saveFeedPrice(name,price);status.textContent="Saved "+name+" at "+money(price)+" per ton. Historical reports use this current price.";await load();}catch(e){status.textContent="Could not save: "+e.message;}finally{button.disabled=false;}});
$("calculateFeedExpense").addEventListener("click",async()=>{const status=$("feedExpenseStatus"),out=$("feedExpenseResults"),btn=$("calculateFeedExpense");out.replaceChildren();if(!/^\d{4}-\d{2}-\d{2}$/.test(date.value)){status.textContent="Choose a date.";return;}
btn.disabled=true;status.textContent="Calculating…";try{
await load();const from=new Date(date.value+"T12:00:00"),to=new Date(from),period=$("feedExpensePeriod").value;
if(period==="week"){from.setDate(from.getDate()-(from.getDay()+6)%7);to.setTime(from.getTime());to.setDate(to.getDate()+7);}
else if(period==="month"){from.setDate(1);to.setFullYear(from.getFullYear(),from.getMonth()+1,1);}
else if(period==="year"){from.setMonth(0,1);to.setFullYear(from.getFullYear()+1,0,1);}
else to.setDate(to.getDate()+1);
const tickets=(await cloud.listTicketsForPeriod(iso(from),iso(to))).filter(t=>!t.is_test),alloc=await cloud.listReportTankAllocations(tickets.map(t=>t.id)),ticketMap=new Map(tickets.map(t=>[t.id,t])),tankMap=new Map(directory.tanks.map(t=>[t.id,t])),farmMap=new Map(directory.farms.map(f=>[f.id,f.name])),priceMap=new Map(prices.map(p=>[p.feed_type.trim().toLowerCase(),p.price_per_ton]));
const farmId=$("feedExpenseFarm").value,tankId=$("feedExpenseTank").value,totals=new Map(),unknown=new Map();let totalCents=0,pricedTons=0;
for(const a of alloc){const t=ticketMap.get(a.ticket_id),tank=tankMap.get(a.tank_id);if(!t||!tank||(farmId&&tank.farm_id!==farmId)||(tankId&&tank.id!==tankId))continue;
const type=String(t.feed_type||"").trim(),price=priceMap.get(type.toLowerCase()),tons=Number(a.tons),farm=farmMap.get(tank.farm_id)||"Unknown farm";
if(!Number.isFinite(tons)||tons<=0)continue;
if(price==null){unknown.set(type||"(feed type missing)",(unknown.get(type||"(feed type missing)")||0)+tons);continue;}
const cents=Math.round(tons*Number(price)*100);totalCents+=cents;pricedTons+=tons;const key=tank.farm_id+"|"+tank.id+"|"+type;const x=totals.get(key)||{farm,tank:tank.tank_label,type,tons:0,cents:0};x.tons+=tons;x.cents+=cents;totals.set(key,x);}
const table=document.createElement("table");table.style.cssText="width:100%;font-size:13px;border-collapse:collapse";const head=document.createElement("tr");for(const v of ["Farm","Tank","Feed","Tons","Cost"]){const th=document.createElement("th");th.textContent=v;th.style.cssText="padding:5px;border-bottom:1px solid #aaa;text-align:left";head.append(th);}table.append(head);
for(const x of [...totals.values()].sort((a,b)=>a.farm.localeCompare(b.farm)||a.tank.localeCompare(b.tank))){const tr=document.createElement("tr");for(const v of [x.farm,x.tank,x.type,x.tons.toFixed(2),money(x.cents/100)]){const td=document.createElement("td");td.textContent=v;td.style.cssText="padding:5px;border-bottom:1px solid #ddd";tr.append(td);}table.append(tr);}out.append(table);
const summary=document.createElement("p");summary.textContent="Priced deliveries: "+pricedTons.toFixed(2)+" tons · "+money(totalCents/100)+" total. Period: "+iso(from)+" through "+iso(new Date(to.getTime()-86400000))+".";out.prepend(summary);
const byFarm=new Map();for(const x of totals.values())byFarm.set(x.farm,(byFarm.get(x.farm)||0)+x.cents);
const farmSummary=document.createElement("p");farmSummary.textContent="Farm totals: "+([...byFarm].map(([name,cents])=>name+" "+money(cents/100)).join("; ")||"No priced farm assignments");out.append(farmSummary);
status.textContent=unknown.size?"Incomplete costs — missing feed prices: "+[...unknown].map(([type,tons])=>type+" ("+tons.toFixed(2)+" tons)").join(", ")+". Add those prices and recalculate.":"Calculated from verified tank assignments and current feed prices. Unassigned tickets are excluded.";
}catch(e){status.textContent="Report unavailable: "+e.message;}finally{btn.disabled=false;}});
const section=$("feedPriceTile");const observer=new MutationObserver(()=>{if(!section.hidden&&cloud.isSignedIn()){observer.disconnect();load();}});observer.observe(document.getElementById("profile"),{attributes:true,subtree:true,attributeFilter:["style","hidden"]});
document.addEventListener("click",e=>{if(e.target.closest("#dashboardExtras")&&cloud.isSignedIn()&&!prices.length)load();});
})();