(()=>{'use strict';
const $=id=>document.getElementById(id);
const panel=document.createElement('div');panel.className='card';panel.innerHTML='<h3>Offline tickets</h3><p id="offlineState">Checking saved tickets…</p><button id="syncOffline" type="button">Sync saved tickets</button>';
document.querySelector('#entry').after(panel);
const open=()=>new Promise((resolve,reject)=>{const req=indexedDB.open('ck-feed-offline-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('pending',{keyPath:'ticket_number'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
async function all(){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('pending');const req=tx.objectStore('pending').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function put(x){const db=await open();return new Promise((resolve,reject)=>{const req=db.transaction('pending','readwrite').objectStore('pending').put(x);req.onsuccess=resolve;req.onerror=()=>reject(req.error)})}
async function del(k){const db=await open();return new Promise((resolve,reject)=>{const req=db.transaction('pending','readwrite').objectStore('pending').delete(k);req.onsuccess=resolve;req.onerror=()=>reject(req.error)})}
async function state(message){try{const a=await all();$('offlineState').textContent=(message?message+' ':'')+a.length+' ticket(s) waiting to sync.'}catch(e){$('offlineState').textContent='Offline storage unavailable: '+e.message}}
const client=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
async function queue(){const ticket_number=$('ticket').value.trim(),tons=Number($('tons').value),destination=$('dest').value.trim(),delivery_date=$('date').value;if(!ticket_number||!delivery_date||!destination||!Number.isFinite(tons)||tons<=0){$('offlineState').textContent='Complete the date, ticket number, tons, and destination first.';return}
if((await all()).some(x=>x.ticket_number===ticket_number)){$('offlineState').textContent='That ticket is already waiting to sync.';return}
const {data:{session}}=await client.auth.getSession();if(!session?.user){$('offlineState').textContent='Sign in while online before saving offline tickets.';return}
const f=$('ticketPhoto')?.files?.[0];if(f&&f.size>10485760){$('offlineState').textContent='Photo exceeds 10 MB. Choose a smaller photo.';return}
await put({ticket_number,tons,destination,delivery_date,user_id:session.user.id,photo:f||null,created:Date.now()});for(const id of ['ticket','tons','dest'])$(id).value='';if($('ticketPhoto'))$('ticketPhoto').value='';await state('Saved on this phone. Do not clear browser website data.');}
async function sync(){if(!navigator.onLine){await state('No connection.');return}const {data:{session}}=await client.auth.getSession();if(!session?.user){await state('Sign in to sync.');return}const d=await client.from('drivers').select('id').eq('user_id',session.user.id).maybeSingle();if(d.error||!d.data){await state('Driver account not found.');return}
let done=0;for(const x of await all()){if(x.user_id!==session.user.id)continue;
const check=await client.from('feed_tickets').select('id,driver_id,photo_path').eq('ticket_number',x.ticket_number).maybeSingle();
if(check.error){await state('Sync paused: '+check.error.message);return}
if(check.data&&check.data.driver_id!==d.data.id){await state('Duplicate ticket number belongs to another driver: '+x.ticket_number);return}
let id=check.data?.id;
if(!id){const result=await client.from('feed_tickets').insert({driver_id:d.data.id,ticket_number:x.ticket_number,delivery_date:x.delivery_date,tons:x.tons,destination:x.destination}).select('id').single();if(result.error){await state('Sync paused on '+x.ticket_number+': '+result.error.message);return}id=result.data.id}
if(x.photo&&!check.data?.photo_path){const ext=x.photo.type==='image/png'?'png':x.photo.type==='image/webp'?'webp':'jpg';const path=session.user.id+'/'+x.ticket_number+'-'+x.created+'.'+ext;const up=await client.storage.from('ticket-photos').upload(path,x.photo,{contentType:x.photo.type||'image/jpeg',upsert:true});if(up.error){await state('Photo upload pending for '+x.ticket_number+': '+up.error.message);return}const link=await client.from('feed_tickets').update({photo_path:path}).eq('id',id);if(link.error){await state('Photo linking pending: '+link.error.message);return}}
await del(x.ticket_number);done++}
await state(done?'Synced '+done+' ticket(s) to cloud.':'Nothing to sync.');if(done)document.getElementById('refresh')?.click()}
$('syncOffline').onclick=()=>sync().catch(e=>state('Sync error: '+e.message));
$('save').addEventListener('click',e=>{if(navigator.onLine||$('save').textContent.includes('correction'))return;e.stopImmediatePropagation();queue().catch(err=>state('Offline save failed: '+err.message))},true);
window.addEventListener('online',()=>sync().catch(()=>{}));state();})();
