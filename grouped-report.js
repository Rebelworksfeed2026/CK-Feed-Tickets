/* Read-only grouped weekly report; no ticket writes. */
(function(){
  "use strict";
  const button=document.getElementById("groupedReportButton");
  if(!button)return;
  const status=document.getElementById("groupedReportStatus");
  const output=document.getElementById("groupedReportResults");
  let reportSequence=0;
  const weekPicker=document.getElementById("cloudWeek");
  const logoutButton=document.getElementById("logout");
  function clearReport(){
    ++reportSequence;
    output.replaceChildren();
    status.textContent="No report loaded for the current selection.";
    button.disabled=false;
  }
  weekPicker.addEventListener("change",clearReport);
  logoutButton.addEventListener("click",clearReport);
  button.addEventListener("click",async()=>{
    const sequence=++reportSequence;
    button.disabled=true;output.replaceChildren();
    status.textContent="Reading selected week's tickets…";
    try{
      const monday=document.getElementById("cloudWeek").value;
      if(!CKCloud.isSignedIn())throw Error("Sign in to calculate this report.");
      const drivers=(await CKCloud.listDrivers()).filter(d=>!d.is_office);
      const batches=await Promise.all(drivers.map(d=>CKCloud.listWeeklyTickets(d.id,monday)));
      const tickets=batches.flat();
      const driverNames=new Map(drivers.map(d=>[d.id,d.name]));
      // Report totals are derived from one unique set of tickets, regardless of repeated query rows.
      const unique=new Map();
      for(const ticket of tickets){
        const key=String(ticket.id||ticket.ticket_number||"");
        if(key&&!unique.has(key))unique.set(key,ticket);
      }
      const reportTickets=[...unique.values()];
      const groups=window.CKTankGroups;
      if(sequence!==reportSequence || !CKCloud.isSignedIn() || document.getElementById("cloudWeek").value!==monday) {
        if(sequence===reportSequence)status.textContent="Report cancelled because the session or selected week changed.";
        return;
      }
      const rows=groups.summarize(reportTickets,"Austin Farms","week");
      const heading=document.createElement("p");
      heading.textContent="Week starting "+monday+" · "+reportTickets.length+" tickets checked across "+drivers.length+" drivers";
      output.appendChild(heading);
      const table=document.createElement("table");
      table.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const head=document.createElement("tr");
      for(const label of ["Tank group","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";head.appendChild(th);
      }
      table.appendChild(head);
      let totalLoads=0,totalHundredths=0;
      for(const group of groups.groups.filter(g=>g.farm==="Austin Farms")){
        const row=rows.find(r=>r.group===group.label);
        const loads=row?.loads||0,tons=row?.tons||0;
        totalLoads+=loads;totalHundredths+=Math.round(tons*100);
        const tr=document.createElement("tr");
        for(const val of [group.label,String(loads),tons.toFixed(2)]){
          const td=document.createElement("td");td.textContent=val;td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      output.appendChild(table);
      // Break down each matched group by the driver who delivered the feed.
      const breakdown=new Map();
      for(const ticket of reportTickets){
        const group=groups.findGroup("Austin Farms",ticket.destination);
        if(!group)continue;
        const key=group.label+"|"+ticket.driver_id;
        const entry=breakdown.get(key)||{group:group.label,driver:driverNames.get(ticket.driver_id)||"Unknown driver",loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        breakdown.set(key,entry);
      }
      if(breakdown.size){
        const title=document.createElement("p");
        title.textContent="Matched tank groups by driver";
        title.style.fontWeight="700";
        output.appendChild(title);
        const detail=document.createElement("table");
        detail.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
        const header=document.createElement("tr");
        for(const label of ["Tank group","Driver","Loads","Tons"]){
          const th=document.createElement("th");th.textContent=label;
          th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
          header.appendChild(th);
        }
        detail.appendChild(header);
        for(const entry of [...breakdown.values()].sort((a,b)=>a.group.localeCompare(b.group)||a.driver.localeCompare(b.driver))){
          const tr=document.createElement("tr");
          for(const value of [entry.group,entry.driver,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
            const td=document.createElement("td");td.textContent=value;
            td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
            tr.appendChild(td);
          }
          detail.appendChild(tr);
        }
        output.appendChild(detail);
      }
      // Exact destination report across every driver. This does not guess farm ownership.
      const destinations=new Map();
      const days=new Map();
      const uniqueTickets=new Set();
      for(const ticket of reportTickets){
        const ticketKey=String(ticket.id||ticket.ticket_number||"");
        if(!ticketKey || uniqueTickets.has(ticketKey))continue;
        uniqueTickets.add(ticketKey);
        const destination=String(ticket.destination||"").trim()||"(Missing destination)";
        const key=destination.toUpperCase()+"|"+ticket.driver_id;
        const entry=destinations.get(key)||{destination,driver:driverNames.get(ticket.driver_id)||"Unknown driver",loads:0,hundredths:0};
        const hundredths=Math.round(Number(ticket.tons)*100);
        if(!Number.isFinite(hundredths))continue;
        entry.loads++;
        entry.hundredths+=hundredths;
        destinations.set(key,entry);
        const date=String(ticket.delivery_date||"");
        if(/^\d{4}-\d{2}-\d{2}$/.test(date)){
          const dayKey=date+"|"+destination.toUpperCase()+"|"+ticket.driver_id;
          const dayEntry=days.get(dayKey)||{date,destination,driver:entry.driver,loads:0,hundredths:0};
          dayEntry.loads++;
          dayEntry.hundredths+=hundredths;
          days.set(dayKey,dayEntry);
        }
      }
      const destinationTitle=document.createElement("p");
      destinationTitle.style.fontWeight="700";
      destinationTitle.textContent="All destinations by driver (exact ticket text)";
      output.appendChild(destinationTitle);
      const destinationTable=document.createElement("table");
      destinationTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const destinationHead=document.createElement("tr");
      for(const label of ["Destination","Driver","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        destinationHead.appendChild(th);
      }
      destinationTable.appendChild(destinationHead);
      for(const entry of [...destinations.values()].sort((a,b)=>a.destination.localeCompare(b.destination,undefined,{numeric:true})||a.driver.localeCompare(b.driver))){
        const tr=document.createElement("tr");
        for(const value of [entry.destination,entry.driver,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        destinationTable.appendChild(tr);
      }
      output.appendChild(destinationTable);
      const dailyTitle=document.createElement("p");
      dailyTitle.style.fontWeight="700";
      dailyTitle.textContent="Daily deliveries by destination and driver";
      output.appendChild(dailyTitle);
      const dailyTable=document.createElement("table");
      dailyTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const dailyHead=document.createElement("tr");
      for(const label of ["Date","Destination","Driver","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        dailyHead.appendChild(th);
      }
      dailyTable.appendChild(dailyHead);
      for(const entry of [...days.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.destination.localeCompare(b.destination,undefined,{numeric:true})||a.driver.localeCompare(b.driver))){
        const tr=document.createElement("tr");
        for(const value of [entry.date,entry.destination,entry.driver,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        dailyTable.appendChild(tr);
      }
      output.appendChild(dailyTable);
      const excluded=reportTickets.filter(t=>!groups.findGroup("Austin Farms",t.destination));
      const note=document.createElement("p");note.className="muted";
      note.textContent="Provisional Austin group matches: "+totalLoads+" loads · "+(totalHundredths/100).toFixed(2)+" tons. "+
        excluded.length+" tickets not matched to Austin groups (may belong to other farms). "+
        "This is a preliminary report based on destination text; farm identity is not yet linked to tickets.";
      output.appendChild(note);
      status.textContent="Read-only grouped report calculated. No tickets were modified.";
    }catch(error){if(sequence===reportSequence)status.textContent="Could not calculate grouped totals: "+(error.message||error);}
    finally{if(sequence===reportSequence)button.disabled=false;}
  });
})();
