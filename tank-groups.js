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
    const candidates=groups.filter(g=>normalize(g.farm)===f);
    const tokens=d.match(/\d+[A-Z]?/g)||[];
    const matches=candidates.filter(g=>tokens.some(t=>g.tanks.some(n=>normalize(n)===t)));
    return matches.length===1?matches[0]:null;
  }
  root.CKTankGroups=Object.freeze({groups,findGroup});
})(typeof window!=="undefined"?window:globalThis);
