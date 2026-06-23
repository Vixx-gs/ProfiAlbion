/** Catálogo de items. Nombres ES oficiales (ao-bin-dumps). */
import NAMES_ES from './item-names.es.json';

/** Categoría de equipo (determina los recursos de crafteo y el coste de encantar). */
export type ItemCategory =
  | 'weapon-1h'
  | 'weapon-2h'
  | 'armor'
  | 'head'
  | 'shoes'
  | 'offhand'
  | 'bag'
  | 'cape';

export interface CatalogItem {
  /** Id base sin encantamiento, p.ej. "T6_2H_HAMMER". */
  id: string;
  /** Nombre oficial en español (con el rango del tier). */
  name: string;
  /** Tier del item (4-8). */
  tier: number;
  /** Clave del tipo de item, común a todos los tiers (p.ej. "2H_HAMMER"). */
  typeKey: string;
  /** Categoría de equipo. */
  category: ItemCategory;
}

const NAME_MAP = NAMES_ES as Record<string, string>;

/** Niveles de encantamiento a escanear (.0 a .3). */
export const ENCHANTS = [0, 1, 2, 3];

/** Tiers cubiertos. */
export const TIERS = [4, 5, 6, 7, 8];

/**
 * Tipos incluidos en el escaneo masivo "Top" (subconjunto curado de equipo de
 * alto valor) para que la carga sea rápida. El resto de items del juego siguen
 * disponibles en el buscador (ALL_ITEMS) mediante consulta bajo demanda.
 */
const CURATED_TYPES = new Set([
  '2H_HAMMER',
  '2H_AXE',
  '2H_ARCANESTAFF',
  'MAIN_SWORD',
  'MAIN_FIRESTAFF',
  '2H_CLAYMORE',
  '2H_BOW',
  '2H_CROSSBOW',
  'MAIN_DAGGER',
  '2H_NATURESTAFF',
  '2H_HOLYSTAFF',
  'ARMOR_CLOTH_SET1',
  'ARMOR_LEATHER_SET1',
  'ARMOR_PLATE_SET1',
  'HEAD_PLATE_SET1',
  'SHOES_PLATE_SET1',
  'BAG',
  'CAPE',
]);

function categoryOf(typeKey: string): ItemCategory {
  if (typeKey.startsWith('2H_')) return 'weapon-2h';
  if (typeKey.startsWith('MAIN_')) return 'weapon-1h';
  if (typeKey.startsWith('HEAD_')) return 'head';
  if (typeKey.startsWith('SHOES_')) return 'shoes';
  if (typeKey.startsWith('OFF_')) return 'offhand';
  if (typeKey === 'BAG') return 'bag';
  if (typeKey === 'CAPE') return 'cape';
  return 'armor';
}

function buildAll(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const id of Object.keys(NAME_MAP)) {
    const m = /^T(\d+)_(.+)$/.exec(id);
    if (!m) continue;
    const tier = Number(m[1]);
    const typeKey = m[2];
    out.push({ id, name: NAME_MAP[id], tier, typeKey, category: categoryOf(typeKey) });
  }
  return out;
}

/** Todos los items del catálogo (para el buscador). */
export const ALL_ITEMS: CatalogItem[] = buildAll();

/** Subconjunto curado que se escanea en la tabla "Top". */
export const ITEM_CATALOG: CatalogItem[] = ALL_ITEMS.filter((i) => CURATED_TYPES.has(i.typeKey));

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
