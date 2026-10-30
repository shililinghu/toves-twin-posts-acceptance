const BASE=new URL('.',self.location).pathname;
const CACHE='toves-pages-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin===location.origin&&u.pathname.startsWith(BASE+'game-campaign-v2/'))e.respondWith((async()=>{const c=await caches.open(CACHE);let path=u.pathname;if(path.endsWith('/'))path+='index.html';return await c.match(path)||fetch(e.request);})());});
self.addEventListener('message',e=>{if(!e.data.prepare)return;const port=e.ports[0];e.waitUntil((async()=>{try{const c=await caches.open(CACHE);if(await c.match(BASE+'__complete')){port.postMessage({done:true});return;}
port.postMessage({status:'Downloading game...'});let size=0;const pieces=await Promise.all([0,1,2,3,4].map(async i=>{const r=await fetch(BASE+'game-pack.'+i);if(!r.ok)throw Error('Download failed. Please retry.');const reader=r.body.getReader(),chunks=[];while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);size+=value.length;port.postMessage({status:'Downloading: '+(size/1048576).toFixed(1)+' / 35.6 MB'});}return chunks;}));const chunks=pieces.flat();
port.postMessage({status:'Preparing resources...'});const stream=new Blob(chunks).stream().pipeThrough(new DecompressionStream('gzip'));const files=await new Response(stream).json();
for(const [path,mime,b64]of files){const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));await c.put(BASE+path,new Response(bytes,{headers:{'Content-Type':mime}}));}
await c.put(BASE+'__complete',new Response('ready'));port.postMessage({done:true});}catch(err){port.postMessage({error:String(err.message||err)});}})());});
