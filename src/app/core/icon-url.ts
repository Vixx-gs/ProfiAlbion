const BASE_URL = 'https://render.albiononline.com/v1/item';
const CACHE = 'albion-icons-v1';
const preloaded = new Set<string>();

export function iconUrl(id: string, size: number = 64): string {
  return `${BASE_URL}/${encodeURIComponent(id)}.png?size=${size}`;
}

async function warmCache(url: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE);
    if (await cache.match(url)) return;
    const res = await fetch(url);
    if (res.ok || res.type === 'opaque') cache.put(url, res);
  } catch {}
}

export function preloadIcon(id: string, size: number = 64): void {
  const url = iconUrl(id, size);
  if (preloaded.has(url)) return;
  preloaded.add(url);
  warmCache(url);
  const img = new Image();
  img.fetchPriority = 'low';
  img.src = url;
}

export function preloadIcons(ids: string[], size: number = 64): void {
  for (const id of ids) {
    preloadIcon(id, size);
  }
}
