/* C&K Feed Tickets offline adapter — staged, NOT loaded by live login-v23.html.
   Reuses the proven Cloud Beta IndexedDB queue approach, adapted to CKCloud.
   Wire only after reviewing idempotency, authentication and UI behavior. */
(()=>{"use strict";
const DB="ck-feed-current-offline-v1", STORE="pending";
function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"key"});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function transaction(mode,action){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);let result;try{result=action(store);}catch(e){db.close();reject(e);return;}tx.oncomplete=()=>{db.close();resolve(result?.result);};tx.onerror=()=>{db.close();reject(tx.error);};tx.onabort=()=>{db.close();reject(tx.error||Error("Offline transaction canceled"));};});}
const list=()=>transaction("readonly",s=>s.getAll());
const key=(uid,n)=>uid+":"+n;
function validate(ticket,file){const d=String(ticket?.delivery_date||""),dt=new Date(d+"T12:00:00"),n=String(ticket?.ticket_number||"").trim(),t=Number(ticket?.tons),dest=String(ticket?.destination||"").trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||Number.isNaN(dt.getTime())||dt.getDay()===0||[dt.getFullYear(),String(dt.getMonth()+1).padStart(2,"0"),String(dt.getDate()).padStart(2,"0")].join("-")!==d||!/^[A-Za-z0-9][A-Za-z0-9-]{0,23}$/.test(n)||!Number.isFinite(t)||t<=0||t>100||!dest||dest.length>120)throw Error("Invalid ticket details.");if(!file||!file.size)throw Error("Original ticket photo required.");if(!/^image\//.test(file.type))throw Error("Ticket photo must be an image.");return {delivery_date:d,ticket_number:n,tons:t,destination:dest};}
async function enqueue(userId,ticket,file){if(!/^[0-9a-f-]{36}$/i.test(userId||""))throw Error("Sign in before saving offline.");const clean=validate(ticket,file),k=key(userId,clean.ticket_number);const existing=(await list()).find(x=>x.ticket.ticket_number===clean.ticket_number);if(existing)throw Error("Ticket already waiting to sync. Nothing overwritten.");const photo=await file.arrayBuffer();if(!photo.byteLength)throw Error("Photo could not be stored.");await transaction("readwrite",s=>s.add({key:k,userId,ticket:clean,photo,photoType:file.type,photoName:file.name||"ticket.jpg",created:Date.now(),state:"pending"}));return clean.ticket_number;}
async function pending(userId){return (await list()).filter(x=>x.userId===userId).sort((a,b)=>a.created-b.created).map(x=>({ticket_number:x.ticket.ticket_number,state:x.state,created:x.created,issue:x.issue||null}));}
async function markBlocked(row,reason){const db=await open();try{await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");const store=tx.objectStore(STORE);store.put({...row,state:"needs_review",issue:String(reason||"Sync result uncertain").slice(0,400)});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
let syncing=false;
async function sync(userId,cloud){
  if(syncing)throw Error("Offline sync already running.");
  syncing=true;
  try{
    if(!userId||!cloud?.findTicketNumber||!cloud?.saveTicketWithPhoto)throw Error("Signed-in cloud session required.");
    const rows=(await list()).filter(x=>x.userId===userId).sort((a,b)=>a.created-b.created);
    let synced=0;
    for(const row of rows){
      if(row.state==="needs_review")throw Error("Ticket "+row.ticket.ticket_number+" requires review before another upload attempt. Original photo is still on this device.");
      let existing;
      try{existing=await cloud.findTicketNumber(row.ticket.ticket_number);}
      catch(error){throw Error("Cannot verify ticket "+row.ticket.ticket_number+" against cloud. Offline copy retained: "+error.message);}
      if(existing){
        await markBlocked(row,"A matching ticket number exists in cloud; compare details and photo before resolving.");
        throw Error("Ticket "+row.ticket.ticket_number+" exists in cloud. Offline copy retained for review.");
      }
      const file=new File([row.photo],row.photoName,{type:row.photoType});
      try{await cloud.saveTicketWithPhoto(row.ticket,file);}
      catch(error){
        // Upload may have completed before a timeout or ticket insert error.
        // Never automatically retry an ambiguous photo upload: doing so can
        // create an orphaned photo or duplicate ticket.
        await markBlocked(row,"Cloud save outcome uncertain: "+error.message);
        throw Error("Ticket "+row.ticket.ticket_number+" may have partially uploaded. Offline photo retained; administrator review required.");
      }
      await transaction("readwrite",store=>store.delete(row.key));
      synced++;
    }
    return {synced,remaining:(await pending(userId)).length};
  }finally{syncing=false;}
}
window.CKOfflineStaged=Object.freeze({enqueue,pending,sync});
})();
