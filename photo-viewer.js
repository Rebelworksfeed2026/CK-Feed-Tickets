(()=>{'use strict';
const db=supabase.createClient(window.SUPABASE_URL,window.SUPABASE_KEY);
const rows=document.getElementById('rows');
const overlay=document.createElement('div');
overlay.id='ticket-photo-overlay';
overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);display:none;flex-direction:column;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;color:white';
overlay.innerHTML='<button type="button" id="ticket-photo-close" style="align-self:flex-end;font-size:20px;padding:10px 18px;margin-bottom:12px">✕ Close</button><div id="ticket-photo-message" role="status" style="padding:10px;text-align:center"></div><img id="ticket-photo-image" alt="Saved delivery ticket photograph" style="display:none;max-width:100%;max-height:78vh;object-fit:contain">';
document.body.appendChild(overlay);
const msg=overlay.querySelector('#ticket-photo-message'),img=overlay.querySelector('#ticket-photo-image');
function close(){overlay.style.display='none';img.removeAttribute('src');img.style.display='none'}
overlay.querySelector('#ticket-photo-close').onclick=close;
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
async function view(ticket){
overlay.style.display='flex';img.style.display='none';msg.textContent='Opening photo for ticket '+ticket+'…';
try{
const {data,error}=await db.from('feed_tickets').select('photo_path').eq('ticket_number',ticket).is('deleted_at',null).maybeSingle();
if(error)throw error;
if(!data?.photo_path){msg.textContent='No saved photo for ticket '+ticket;return}
const r=await db.storage.from('ticket-photos').createSignedUrl(data.photo_path,300);
if(r.error)throw r.error;
img.onload=()=>{msg.textContent='Ticket '+ticket;img.style.display='block'};
img.onerror=()=>{msg.textContent='Photo could not be displayed. Please try again.'};
img.src=r.data.signedUrl;
}catch(e){msg.textContent='Unable to open photo: '+(e.message||String(e))}
}
rows.addEventListener('click',e=>{const b=e.target.closest('[data-view-photo]');if(b){e.preventDefault();view(b.dataset.viewPhoto)}});
const observer=new MutationObserver(()=>{for(const tr of rows.querySelectorAll('tr')){const cells=tr.querySelectorAll('td');if(cells.length<8||tr.querySelector('[data-view-photo]'))continue;if(tr.dataset.hasPhoto!=='yes')continue;const ticket=cells[2].textContent.trim();if(!ticket)continue;const b=document.createElement('button');b.type='button';b.textContent='📷 Photo';b.dataset.viewPhoto=ticket;b.style.marginLeft='6px';cells[7].appendChild(b)}});
observer.observe(rows,{childList:true});
})();