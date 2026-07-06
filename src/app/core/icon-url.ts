const BASE_URL = 'https://render.albiononline.com/v1/item';

const preloaded = new Set<string>();

export function iconUrl(id: string, size: number = 64): string {
  return `${BASE_URL}/${encodeURIComponent(id)}.png?size=${size}`;
}

export function preloadIcon(id: string, size: number = 64): void {
  const url = iconUrl(id, size);
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.fetchPriority = 'low';
  img.src = url;
}

export function preloadIcons(ids: string[], size: number = 64): void {
  for (const id of ids) {
    preloadIcon(id, size);
  }
}
