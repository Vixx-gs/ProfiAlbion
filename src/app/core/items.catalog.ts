/** Catálogo de items para el escáner de flips. Nombres ES oficiales (ao-bin-dumps). */
import NAMES_ES from './item-names.es.json';

export interface CatalogItem {
  id: string;
  /** Nombre oficial en español (incluye el tier, p.ej. "del maestro"). */
  name: string;
}

const NAME_MAP = NAMES_ES as Record<string, string>;

/** Encantamientos a escanear (donde está la plata grande). */
const ENCHANTS = ['', '@1', '@2', '@3'];

function buildCatalog(): CatalogItem[] {
  const out: CatalogItem[] = [];
  for (const baseId of Object.keys(NAME_MAP)) {
    for (const ench of ENCHANTS) {
      out.push({ id: `${baseId}${ench}`, name: NAME_MAP[baseId] });
    }
  }
  return out;
}

export const ITEM_CATALOG: CatalogItem[] = buildCatalog();

/** Devuelve "Gran martillo del maestro (T6.3)" a partir del id (T6_2H_HAMMER@2). */
export function displayName(id: string): string {
  const baseId = id.split('@')[0];
  const name = NAME_MAP[baseId];
  if (!name) return id;
  const tier = baseId.slice(0, 2);
  const ench = id.includes('@') ? '.' + id.split('@')[1] : '';
  return `${name} (${tier}${ench})`;
}
