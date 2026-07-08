const BASE_URL = 'https://render.albiononline.com/v1/item';
const CACHE = 'albion-icons-v1';
const preloaded = new Set<string>();
const FALLBACK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" fill="#131826" rx="8"/>' +
    '<text x="32" y="36" text-anchor="middle" fill="#5f6a86" font-size="10" font-family="sans-serif">?</text>' +
    '</svg>',
  );

export function iconUrl(id: string, size: number = 64): string {
  return `${BASE_URL}/${encodeURIComponent(id)}.png?size=${size}`;
}

export function fallbackIcon(): string {
  return FALLBACK;
}

async function warmCache(url: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE);
    if (await cache.match(url)) return;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok || res.type === 'opaque') cache.put(url, res);
  } catch {}
}

export function preloadIcon(id: string, size: number = 64): void {
  const url = iconUrl(id, size);
  if (preloaded.has(url)) return;
  preloaded.add(url);
  warmCache(url);
  const img = new Image();
  img.fetchPriority = 'high';
  img.src = url;
}

export function preloadIcons(ids: string[], size: number = 64): void {
  for (const id of ids) preloadIcon(id, size);
}

export function preloadIconsBatch(
  ids: string[],
  size: number = 64,
  batchSize: number = 10,
): void {
  const batch = ids.slice(0, batchSize);
  for (const id of batch) preloadIcon(id, size);
  if (ids.length > batchSize) {
    requestIdleCallback(() => preloadIconsBatch(ids.slice(batchSize), size, batchSize));
  }
}
