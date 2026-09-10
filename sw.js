const CACHE='qazaq-boss-v6';
const ASSETS=['./','./index.html','./admin.html','./driver.html','./driver.js','./styles.css','./app.js','./admin.js','./manifest.webmanifest','./assets/car-front.jpg','./assets/car-night.jpg','./assets/car-rear.jpg','./assets/interior.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
