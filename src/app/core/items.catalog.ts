/** Catálogo de items. Nombres ES oficiales (ao-bin-dumps). */
import NAMES_ES from './item-names.es.json';

export interface CatalogItem {
  /** Id base sin encantamiento, p.ej. "T6_2H_HAMMER". */
  id: string;
  /** Nombre oficial en español (con el rango del tier). */
  name: string;
  /** Tier del item (4-8). */
  tier: number;
  /** Clave del tipo de item, común a todos los tiers (p.ej. "2H_HAMMER"). */
  typeKey: string;
}

const NAME_MAP = NAMES_ES as Record<string, string>;

/** Niveles de encantamiento a escanear (.0 a .3). */
export const ENCHANTS = [0, 1, 2, 3];

/** Tiers cubiertos. */
export const TIERS = [4, 5, 6, 7, 8];

function buildAll(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const id of Object.keys(NAME_MAP)) {
    const m = /^T(\d+)_(.+)$/.exec(id);
    if (!m) continue;
    const tier = Number(m[1]);
    const typeKey = m[2];
    out.push({ id, name: NAME_MAP[id], tier, typeKey });
  }
  return out;
}

/** Todos los items del catálogo: armas y armaduras de todo tipo y tier (sin monturas ni consumibles). */
export const ALL_ITEMS: CatalogItem[] = buildAll();

/** Catálogo que se escanea ("Top" y buscador): el mismo conjunto completo. */
export const ITEM_CATALOG: CatalogItem[] = ALL_ITEMS;

/** Metadatos de un item base por su id (cualquiera del catálogo completo). */
export const ITEM_BY_ID = new Map<string, CatalogItem>(ALL_ITEMS.map((i) => [i.id, i]));

/** Nivel de encantamiento de un id completo (T6_BAG@2 → 2). */
export function enchantOf(fullId: string): number {
  const at = fullId.indexOf('@');
  return at === -1 ? 0 : Number(fullId.slice(at + 1)) || 0;
}

/** Id base (sin @n) de un id completo. */
export function baseOf(fullId: string): string {
  const at = fullId.indexOf('@');
  return at === -1 ? fullId : fullId.slice(0, at);
}

/** Devuelve "Daga del maestro (T6.2)" a partir del id (T6_MAIN_DAGGER@2). */
export function displayName(fullId: string): string {
  const baseId = baseOf(fullId);
  const name = NAME_MAP[baseId];
  if (!name) return fullId;
  const tier = baseId.slice(0, 2);
  const ench = enchantOf(fullId);
  return `${name} (${tier}${ench ? '.' + ench : ''})`;
}
