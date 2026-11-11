/* C&K Feed Tickets — reporting groups. Original ticket destinations remain unchanged.
   Each ticket is credited once to its matched reporting group. */
(function(root){
  "use strict";
  const groups = [
    {farm:"Austin Farms",label:"101–105",tanks:["101","102","103","104","105"]},
    {farm:"Austin Farms",label:"106/110",tanks:["106","110"]},
    {farm:"Austin Farms",label:"107",tanks:["107"]}
  ];
  function normalize(value){return String(value ?? "").trim().toUpperCase().replace(/\s+/g," ");}
  function findGroup(farm,ticketDestination){
    const f=normalize(farm), d=normalize(ticketDestination);
    // Bare tank numbers are ambiguous across farms; do not guess farm ownership.
    if (!d.includes(f)) return null;
    const candidates=groups.filter(g=>normalize(g.farm)===f);
    const tokens=d.match(/\d+[A-Z]?/g)||[];
    const matches=candidates.filter(g=>tokens.some(t=>g.tanks.some(n=>normalize(n)===t)));
    return matches.length===1?matches[0]:null;
  }
  function summarize(tickets, farm, period="week"){
    const result=new Map();
    const seen=new Set();
    for(const ticket of tickets){
      const id=String(ticket.id ?? ticket.ticket_number ?? "").trim();
      if(!id || seen.has(id))continue;
      seen.add(id);
      const group=findGroup(farm,ticket.destination);
      if(!group)continue;
      const date=String(ticket.delivery_date ?? "");
      if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(date))continue;
      const tons=Number(ticket.tons);
      if(!Number.isFinite(tons)||tons<=0)continue;
      const d=new Date(date+"T12:00:00Z");
      if(Number.isNaN(d.getTime()))continue;
      const monday=new Date(d);
      monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay()+6)%7));
      const bucket=period==="day"?date:period==="month"?date.slice(0,7):period==="year"?date.slice(0,4):monday.toISOString().slice(0,10);
      const key=bucket+"|"+group.label;
      const entry=result.get(key)||{period:bucket,farm:group.farm,group:group.label,loads:0,tons:0};
      entry.loads++;entry.tons+=tons;
      result.set(key,entry);
    }
    return [...result.values()].map(x=>({...x,tons:Math.round(x.tons*100)/100})).sort((a,b)=>a.period.localeCompare(b.period)||a.group.localeCompare(b.group));
  }
  root.CKTankGroups=Object.freeze({groups,findGroup,summarize});
})(typeof window!=="undefined"?window:globalThis);
