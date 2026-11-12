/* Preview-only offline shell cache. Never intercept Supabase, authentication,
   ticket/photo POSTs or other remote requests. Does not affect production page. */
const CACHE="ck-offline-preview-shell-v5";
const ASSETS=[
 "./login-offline-preview.html",
 "./offline-current-adapter.js",
 "./supabase-config.js",
 "./ticket-photo-storage.js",
 "./ticket-ocr-offline-preview.js",
 "./tank-groups.js",
 "./grouped-report.js",
 "./farm-period-report.js",
 "./apple-touch-icon-catfish.png"
];
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(ASSETS);
  await self.skipWaiting();
 })());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys()){
   if(key.startsWith("ck-offline-preview-shell-")&&key!==CACHE)await caches.delete(key);
  }
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 const path=url.pathname.split("/").pop();
 const allowed=new Set(ASSETS.map(x=>x.slice(2)));
 if(!allowed.has(path))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // Prefer fresh code while connected; retain the installed shell offline.
  // Never cache cloud requests or submitted ticket/photo data.
  try{
   const response=await fetch(req);
   if(response.ok){await cache.put(req,response.clone());return response;}
   const saved=await cache.match(req,{ignoreSearch:true});
   return saved||response;
  }catch(error){
   const saved=await cache.match(req,{ignoreSearch:true});
   if(saved)return saved;
   throw error;
  }
 })());
});
