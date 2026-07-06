const CACHE = 'albion-icons-v1';
const CDN = 'https://render.albiononline.com/v1/item';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
    ]),
  );
});

self.addEventListener('fetch', (e) => {
  if (!e.request.url.startsWith(CDN)) return;
  e.respondWith(respond(e.request));
});

async function respond(req: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
