/** Catálogo de items para el escáner de flips. Nombres ES oficiales (ao-bin-dumps). */
import NAMES_ES from './item-names.es.json';

/** Categoría de equipo (determina los recursos de crafteo y, con ello, el coste de encantar). */
export type ItemCategory = 'weapon-1h' | 'weapon-2h' | 'armor' | 'head' | 'shoes' | 'bag' | 'cape';

export interface CatalogItem {
  /** Id base sin encantamiento, p.ej. "T6_2H_HAMMER". */
  id: string;
  /** Nombre oficial en español, incluye el rango del tier (p.ej. "del maestro"). */
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

/** Tiers cubiertos por el catálogo. */
export const TIERS = [4, 5, 6, 7, 8];

/** Adjetivo de rango por tier (Adept's, Expert's, Master's, Grandmaster's, Elder's). */
const RANK: Record<number, string> = {
  4: 'del adepto',
  5: 'del experto',
  6: 'del maestro',
  7: 'del gran maestro',
  8: 'del anciano',
};

function categoryOf(typeKey: string): ItemCategory {
  if (typeKey.startsWith('2H_')) return 'weapon-2h';
  if (typeKey.startsWith('MAIN_')) return 'weapon-1h';
  if (typeKey.startsWith('HEAD_')) return 'head';
  if (typeKey.startsWith('SHOES_')) return 'shoes';
  if (typeKey === 'BAG') return 'bag';
  if (typeKey === 'CAPE') return 'cape';
  return 'armor';
}

/**
 * El json solo trae T6-T8. Para T4/T5 generamos el nombre a partir del nombre
 * base de T6 (sin el rango "del maestro") + el rango del tier correspondiente.
 */
function buildCatalog(): { items: CatalogItem[]; nameByBase: Record<string, string> } {
  const nameByBase: Record<string, string> = { ...NAME_MAP };

  // Tipos de item únicos, tomados de las entradas T6.
  const typeKeys = Object.keys(NAME_MAP)
    .filter((id) => id.startsWith('T6_'))
    .map((id) => id.slice(3));

  const items: CatalogItem[] = [];
  for (const typeKey of typeKeys) {
    const base = NAME_MAP[`T6_${typeKey}`].replace(/ del maestro$/, '');
    for (const tier of TIERS) {
      const id = `T${tier}_${typeKey}`;
      // Nombre explícito del json (preserva nombres únicos como "La mano de Khor")
      // o generado por patrón para los tiers que faltan (T4/T5).
      const name = NAME_MAP[id] ?? `${base} ${RANK[tier]}`;
      nameByBase[id] = name;
      items.push({ id, name, tier, typeKey, category: categoryOf(typeKey) });
    }
  }
  return { items, nameByBase };
}

const { items, nameByBase } = buildCatalog();

export const ITEM_CATALOG: CatalogItem[] = items;

/** Metadatos de un item base por su id (sin encantamiento). */
export const ITEM_BY_ID = new Map<string, CatalogItem>(items.map((i) => [i.id, i]));

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
  const name = nameByBase[baseId];
  if (!name) return fullId;
  const tier = baseId.slice(0, 2);
  const ench = enchantOf(fullId);
  return `${name} (${tier}${ench ? '.' + ench : ''})`;
}
