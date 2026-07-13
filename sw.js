const CACHE_NAME="emb-cache-v2";
const ASSETS=[
  "./",
  "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];

self.addEventListener("install",e=>{
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>Promise.all(ASSETS.map(url=>cache.add(url).catch(()=>{}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

function esActivoEstatico(url){
  return url.origin===self.location.origin||ASSETS.some(a=>a.startsWith("http")&&a===url.href);
}

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const url=new URL(e.request.url);
  if(!esActivoEstatico(url))return; // deja pasar llamadas a Supabase/API sin cache-first: siempre red, para no mostrar datos viejos
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise=fetch(e.request).then(networkResp=>{
        if(networkResp&&(networkResp.status===200||networkResp.type==="opaque")){
          const clone=networkResp.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(e.request,clone));
        }
        return networkResp;
      }).catch(()=>cached);
      return cached||fetchPromise;
    })
  );
});
