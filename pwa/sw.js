/* SIJIL — Service Worker: شبكة أولًا مع احتياط من الذاكرة، وصفحة رئيسية بديلة دون اتصال */
const V='sijil-v70',CORE=['./','index.html','eq-db.js','config.js','manifest.webmanifest','privacy.html','icons/icon-192.png','icons/icon-512.png','icons/icon-192-maskable.png','fonts/Almarai-Regular.ttf','fonts/Cairo-Regular.ttf','fonts/Cairo-400-arabic.woff','fonts/Cairo-600-arabic.woff','fonts/Cairo-700-arabic.woff','fonts/Cairo-800-arabic.woff','fonts/BarlowCondensed-600-latin.woff','fonts/BarlowCondensed-700-latin.woff','fonts/BarlowCondensed-800-latin.woff'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.pathname.startsWith('/api/')||u.pathname.indexOf('/.well-known/')===0||/assetlinks\.json$/.test(u.pathname)||/workers\.dev$/.test(u.hostname))return;
 e.respondWith(fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||res.type==='cors')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
  .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))))});
