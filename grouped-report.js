/* Read-only grouped weekly report; no ticket writes. */
(function(){
  "use strict";
  const button=document.getElementById("groupedReportButton");
  if(!button)return;
  const status=document.getElementById("groupedReportStatus");
  const output=document.getElementById("groupedReportResults");
  button.addEventListener("click",async()=>{
    button.disabled=true;output.replaceChildren();
    status.textContent="Reading selected week's tickets…";
    try{
      const monday=document.getElementById("cloudWeek").value;
      const drivers=(await CKCloud.listDrivers()).filter(d=>!d.is_office);
      const batches=await Promise.all(drivers.map(d=>CKCloud.listWeeklyTickets(d.id,monday)));
      const tickets=batches.flat();
      const groups=window.CKTankGroups;
      const rows=groups.summarize(tickets,"Austin Farms","week");
      const heading=document.createElement("p");
      heading.textContent="Week starting "+monday+" · "+tickets.length+" tickets checked across "+drivers.length+" drivers";
      output.appendChild(heading);
      const table=document.createElement("table");
      table.style.cssText="width:100%;border-collapse:collapse;font-size:14px";
      const head=document.createElement("tr");
      for(const label of ["Tank group","Loads","Tons"]){
        const th=document.createElement("th");th.textContent=label;th.style.cssText="text-align:left;padding:7px;border-bottom:1px solid #b5c5d1";head.appendChild(th);
      }
      table.appendChild(head);
      let totalLoads=0,totalTons=0;
      for(const group of groups.groups.filter(g=>g.farm==="Austin Farms")){
        const row=rows.find(r=>r.group===group.label);
        const loads=row?.loads||0,tons=row?.tons||0;
        totalLoads+=loads;totalTons+=tons;
        const tr=document.createElement("tr");
        for(const val of [group.label,String(loads),tons.toFixed(2)]){
          const td=document.createElement("td");td.textContent=val;td.style.cssText="padding:7px;border-bottom:1px solid #d8e3e9";tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      output.appendChild(table);
      const matched=new Set(groups.groups.filter(g=>g.farm==="Austin Farms").flatMap(g=>g.tanks));
      const excluded=tickets.filter(t=>!groups.findGroup("Austin Farms",t.destination));
      const note=document.createElement("p");note.className="muted";
      note.textContent="Matched: "+totalLoads+" loads · "+totalTons.toFixed(2)+" tons. "+
        excluded.length+" tickets not matched to Austin groups (may belong to other farms). "+
        "This is a preliminary report based on destination text; farm identity is not yet linked to tickets.";
      output.appendChild(note);
      status.textContent="Read-only grouped report calculated. No tickets were modified.";
    }catch(error){status.textContent="Could not calculate grouped totals: "+(error.message||error);}
    finally{button.disabled=false;}
  });
})();
