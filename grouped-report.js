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
  // The grouped report includes every driver; switching the individual-driver tab
  // must not cancel or relabel this independent all-driver report.
  logoutButton.addEventListener("click",clearReport);
  button.addEventListener("click",async()=>{
    const sequence=++reportSequence;
    button.disabled=true;output.replaceChildren();
    status.textContent="Reading selected week's tickets…";
    try{
      const monday=document.getElementById("cloudWeek").value;
      const weekStart=new Date(monday+"T12:00:00Z");
      if(!/^\d{4}-\d{2}-\d{2}$/.test(monday)||Number.isNaN(weekStart.getTime())||weekStart.getUTCDay()!==1||weekStart.toISOString().slice(0,10)!==monday){
        throw Error("Select a valid Monday as the starting date.");
      }
      const weekEnd=new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate()+7);
      const endDate=weekEnd.toISOString().slice(0,10);
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
      const validTickets=reportTickets.filter(t=>{
        const date=String(t.delivery_date||"");
        const parsed=new Date(date+"T12:00:00Z");
        return Number.isFinite(Number(t.tons))&&Number(t.tons)>0&&Number(t.tons)<=100&&
          /^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(parsed.getTime())&&
          parsed.toISOString().slice(0,10)===date&&parsed.getUTCDay()!==0&&
          date>=monday&&date<endDate;
      });
      const invalidCount=reportTickets.length-validTickets.length;
      // Verified tank allocations, not destination-text guesses. A ticket may be split
      // across tanks, so count ticket loads only once in overall totals.
      const [allocations,directory]=await Promise.all([
        CKCloud.listReportTankAllocations(validTickets.map(t=>t.id)),
        CKCloud.listFarmsAndTanks()
      ]);
      if(sequence!==reportSequence || !CKCloud.isSignedIn() || document.getElementById("cloudWeek").value!==monday)return;
      const ticketById=new Map(validTickets.map(t=>[t.id,t]));
      const farmById=new Map(directory.farms.map(f=>[f.id,f.name]));
      const tankById=new Map(directory.tanks.map(t=>[t.id,t]));
      const allocatedByTicket=new Map(),verified=new Map();
      for(const a of allocations){
        const ticket=ticketById.get(a.ticket_id),tank=tankById.get(a.tank_id);
        if(!ticket||!tank)continue;
        const cents=Math.round(Number(a.tons)*100);
        if(!Number.isFinite(cents)||cents<=0)continue;
        allocatedByTicket.set(ticket.id,(allocatedByTicket.get(ticket.id)||0)+cents);
        const farm=farmById.get(tank.farm_id)||"Unknown farm";
        const key=tank.farm_id+"|"+tank.id;
        const entry=verified.get(key)||{farm,tank:tank.tank_label,loads:new Set(),cents:0};
        entry.loads.add(ticket.id);entry.cents+=cents;verified.set(key,entry);
      }
      const allocationIssues=validTickets.filter(t=>(allocatedByTicket.get(t.id)||0)!==Math.round(Number(t.tons)*100));
      const verifiedTitle=document.createElement("p");
      verifiedTitle.style.fontWeight="700";
      verifiedTitle.textContent="Verified farm and tank allocations — all drivers";
      output.appendChild(verifiedTitle);
      const verifiedTable=document.createElement("table");
      verifiedTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const verifiedHead=document.createElement("tr");
      for(const label of ["Farm","Tank","Tickets","Tons"]){
        const th=document.createElement("th");th.textContent=label;th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";verifiedHead.appendChild(th);
      }
      verifiedTable.appendChild(verifiedHead);
      for(const entry of [...verified.values()].sort((a,b)=>a.farm.localeCompare(b.farm)||a.tank.localeCompare(b.tank,undefined,{numeric:true}))){
        const tr=document.createElement("tr");
        for(const value of [entry.farm,entry.tank,String(entry.loads.size),(entry.cents/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";tr.appendChild(td);
        }
        verifiedTable.appendChild(tr);
      }
      output.appendChild(verifiedTable);
      const verifiedNote=document.createElement("p");
      verifiedNote.className="muted";
      verifiedNote.textContent=allocationIssues.length
        ?allocationIssues.length+" ticket(s) have missing, partial, or excessive tank allocations. Their full ticket tons remain in the all-driver totals; review assignments before relying on farm totals."
        :"All "+validTickets.length+" valid ticket(s) are fully allocated to registered tanks.";
      output.appendChild(verifiedNote);
      const rows=groups.summarize(validTickets,"Austin Farms","week");
      const allHundredths=validTickets.reduce((sum,t)=>sum+Math.round(Number(t.tons)*100),0);
      const allLoads=validTickets.length;
      const heading=document.createElement("p");
      heading.textContent="Week starting "+monday+" · "+reportTickets.length+" tickets checked across "+drivers.length+" drivers";
      output.appendChild(heading);
      const summary=document.createElement("p");
      summary.style.fontWeight="700";
      summary.textContent="All drivers: "+allLoads+" loads · "+(allHundredths/100).toFixed(2)+" tons";
      const scopeNote=document.createElement("p");
      scopeNote.textContent="All-driver totals include every farm. Austin tank groups below include only destinations provisionally matched to Austin; unmatched loads remain in all-driver totals. A tank assignment is not counted as Austin without confirmed farm ownership.";
      output.appendChild(scopeNote);
      output.appendChild(summary);
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
      const groupDays=groups.summarize(validTickets,"Austin Farms","day");
      const groupDayTitle=document.createElement("p");
      groupDayTitle.style.fontWeight="700";
      groupDayTitle.textContent="Daily Austin tank-group totals (provisional matching)";
      output.appendChild(groupDayTitle);
      const groupDayTable=document.createElement("table");
      groupDayTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const groupDayHead=document.createElement("tr");
      for(const label of ["Date","Tank group","Loads","Tons"]){
        const th=document.createElement("th");
        th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        groupDayHead.appendChild(th);
      }
      groupDayTable.appendChild(groupDayHead);
      for(const entry of groupDays){
        const tr=document.createElement("tr");
        for(const value of [entry.period,entry.group,String(entry.loads),entry.tons.toFixed(2)]){
          const td=document.createElement("td");
          td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        groupDayTable.appendChild(tr);
      }
      output.appendChild(groupDayTable);
      // Break down each matched group by the driver who delivered the feed.
      const driverTotals=new Map();
      for(const ticket of validTickets){
        const key=String(ticket.driver_id||"");
        const entry=driverTotals.get(key)||{name:driverNames.get(ticket.driver_id)||"Unknown driver",loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        driverTotals.set(key,entry);
      }
      const driverTitle=document.createElement("p");
      driverTitle.style.fontWeight="700";
      driverTitle.textContent="Weekly totals by driver";
      output.appendChild(driverTitle);
      const driverTable=document.createElement("table");
      driverTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const driverHead=document.createElement("tr");
      for(const label of ["Driver","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        driverHead.appendChild(th);
      }
      driverTable.appendChild(driverHead);
      for(const entry of [...driverTotals.values()].sort((a,b)=>a.name.localeCompare(b.name))){
        const tr=document.createElement("tr");
        for(const value of [entry.name,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        driverTable.appendChild(tr);
      }
      output.appendChild(driverTable);
      const dayTotals=new Map();
      for(const ticket of validTickets){
        const date=String(ticket.delivery_date);
        const entry=dayTotals.get(date)||{date,loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        dayTotals.set(date,entry);
      }
      const dayTitle=document.createElement("p");
      dayTitle.style.fontWeight="700";
      dayTitle.textContent="Daily totals — all drivers";
      output.appendChild(dayTitle);
      const dayTable=document.createElement("table");
      dayTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const dayHead=document.createElement("tr");
      for(const label of ["Date","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        dayHead.appendChild(th);
      }
      dayTable.appendChild(dayHead);
      for(const entry of [...dayTotals.values()].sort((a,b)=>a.date.localeCompare(b.date))){
        const tr=document.createElement("tr");
        for(const value of [entry.date,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        dayTable.appendChild(tr);
      }
      output.appendChild(dayTable);
      const driverDayTotals=new Map();
      for(const ticket of validTickets){
        const date=String(ticket.delivery_date);
        const driver=driverNames.get(ticket.driver_id)||"Unknown driver";
        const key=date+"|"+ticket.driver_id;
        const entry=driverDayTotals.get(key)||{date,driver,loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        driverDayTotals.set(key,entry);
      }
      const driverDayTitle=document.createElement("p");
      driverDayTitle.style.fontWeight="700";
      driverDayTitle.textContent="Daily totals by driver";
      output.appendChild(driverDayTitle);
      const driverDayTable=document.createElement("table");
      driverDayTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const driverDayHead=document.createElement("tr");
      for(const label of ["Date","Driver","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        driverDayHead.appendChild(th);
      }
      driverDayTable.appendChild(driverDayHead);
      for(const entry of [...driverDayTotals.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.driver.localeCompare(b.driver))){
        const tr=document.createElement("tr");
        for(const value of [entry.date,entry.driver,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        driverDayTable.appendChild(tr);
      }
      output.appendChild(driverDayTable);
      const companyNames=new Map(drivers.map(d=>[d.id,d.company||"Unassigned company"]));
      const companyTotals=new Map();
      for(const ticket of validTickets){
        const company=companyNames.get(ticket.driver_id)||"Unassigned company";
        const entry=companyTotals.get(company)||{company,loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        companyTotals.set(company,entry);
      }
      const companyTitle=document.createElement("p");
      companyTitle.style.fontWeight="700";
      companyTitle.textContent="Weekly totals by company";
      output.appendChild(companyTitle);
      const companyTable=document.createElement("table");
      companyTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const companyHead=document.createElement("tr");
      for(const label of ["Company","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        companyHead.appendChild(th);
      }
      companyTable.appendChild(companyHead);
      for(const entry of [...companyTotals.values()].sort((a,b)=>a.company.localeCompare(b.company))){
        const tr=document.createElement("tr");
        for(const value of [entry.company,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        companyTable.appendChild(tr);
      }
      output.appendChild(companyTable);
      const companyDayTotals=new Map();
      for(const ticket of validTickets){
        const company=companyNames.get(ticket.driver_id)||"Unassigned company";
        const date=String(ticket.delivery_date);
        const key=date+"|"+company;
        const entry=companyDayTotals.get(key)||{date,company,loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        companyDayTotals.set(key,entry);
      }
      const companyDayTitle=document.createElement("p");
      companyDayTitle.style.fontWeight="700";
      companyDayTitle.textContent="Daily totals by company";
      output.appendChild(companyDayTitle);
      const companyDayTable=document.createElement("table");
      companyDayTable.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const companyDayHead=document.createElement("tr");
      for(const label of ["Date","Company","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;
        th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
        companyDayHead.appendChild(th);
      }
      companyDayTable.appendChild(companyDayHead);
      for(const entry of [...companyDayTotals.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.company.localeCompare(b.company))){
        const tr=document.createElement("tr");
        for(const value of [entry.date,entry.company,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
          const td=document.createElement("td");td.textContent=value;
          td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
          tr.appendChild(td);
        }
        companyDayTable.appendChild(tr);
      }
      output.appendChild(companyDayTable);
      const breakdown=new Map();
      for(const ticket of validTickets){
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
      for(const ticket of validTickets){
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
      const unmatchedDestinations=new Map();
      for(const ticket of validTickets){
        if(groups.findGroup("Austin Farms",ticket.destination))continue;
        const destination=String(ticket.destination||"").trim()||"(Missing destination)";
        const key=destination.toUpperCase();
        const entry=unmatchedDestinations.get(key)||{destination,loads:0,hundredths:0};
        entry.loads++;
        entry.hundredths+=Math.round(Number(ticket.tons)*100);
        unmatchedDestinations.set(key,entry);
      }
      if(unmatchedDestinations.size){
        const title=document.createElement("p");
        title.style.fontWeight="700";
        title.textContent="Destinations not matched to Austin groups";
        output.appendChild(title);
        const table=document.createElement("table");
        table.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
        const header=document.createElement("tr");
        for(const label of ["Destination","Loads","Tons"]){
          const th=document.createElement("th");th.textContent=label;
          th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";
          header.appendChild(th);
        }
        table.appendChild(header);
        for(const entry of [...unmatchedDestinations.values()].sort((a,b)=>a.destination.localeCompare(b.destination,undefined,{numeric:true}))){
          const tr=document.createElement("tr");
          for(const value of [entry.destination,String(entry.loads),(entry.hundredths/100).toFixed(2)]){
            const td=document.createElement("td");td.textContent=value;
            td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";
            tr.appendChild(td);
          }
          table.appendChild(tr);
        }
        output.appendChild(table);
      }
      const excluded=validTickets.filter(t=>!groups.findGroup("Austin Farms",t.destination));
      const excludedHundredths=excluded.reduce((sum,t)=>sum+Math.round(Number(t.tons)*100),0);
      const note=document.createElement("p");note.className="muted";
      note.textContent="Provisional Austin group matches: "+totalLoads+" loads · "+(totalHundredths/100).toFixed(2)+" tons. "+
        "Unmatched destinations: "+excluded.length+" loads · "+(excludedHundredths/100).toFixed(2)+" tons (may belong to other farms). "+
        "This is a preliminary report based on destination text; farm identity is not yet linked to tickets.";
      output.appendChild(note);
      if(invalidCount){
        const warning=document.createElement("p");
        warning.className="muted";
        warning.textContent=invalidCount+" ticket(s) excluded from totals due to invalid date, Sunday/out-of-week delivery, or tonnage; review source records.";
        output.appendChild(warning);
      }
      // Keep the iPhone report manageable: show the overview first, with expandable tables.
      const sectionTitles=new Set([
        "Verified farm and tank allocations — all drivers",
        "Daily Austin tank-group totals (provisional matching)",
        "Weekly totals by driver",
        "Daily totals — all drivers",
        "Daily totals by driver",
        "Weekly totals by company",
        "Daily totals by company",
        "Matched tank groups by driver",
        "All destinations by driver (exact ticket text)",
        "Daily deliveries by destination and driver",
        "Destinations not matched to Austin groups"
      ]);
      for(const title of [...output.querySelectorAll("p")]){
        if(!sectionTitles.has(title.textContent))continue;
        const next=title.nextElementSibling;
        if(!next||next.tagName!=="TABLE")continue;
        const details=document.createElement("details");
        details.style.cssText="margin:12px 0;border:1px solid #d8e3e9;border-radius:8px;padding:9px";
        const summary=document.createElement("summary");
        summary.textContent=title.textContent;
        summary.style.cssText="font-weight:700;cursor:pointer;padding:5px";
        details.appendChild(summary);
        next.parentNode.insertBefore(details,title);
        details.appendChild(next);
        title.remove();
      }
      status.textContent="Read-only grouped report calculated. Open a section to view details. No tickets were modified.";
    }catch(error){if(sequence===reportSequence)status.textContent="Could not calculate grouped totals: "+(error.message||error);}
    finally{if(sequence===reportSequence)button.disabled=false;}
  });
})();
