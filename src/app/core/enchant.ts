/**
 * Coste de encantamiento de equipo en Albion Online.
 *
 * Para subir un item un nivel de encantamiento se combina en la mesa de
 * encantamiento con materiales del MISMO tier:
 *   .0 → .1  Runa   (RUNE)
 *   .1 → .2  Alma   (SOUL)
 *   .2 → .3  Reliquia (RELIC)
 *
 * Cantidad por nivel = 6 × (recursos de crafteo del item).
 * Ej.: arma a 2 manos (32 recursos) → 192 materiales; casco de cuero (8) → 48.
 * Fuente: https://wiki.albiononline.com/wiki/Enchanting
 */
import { ItemCategory } from './items.catalog';

/** Multiplicador de la fórmula de encantamiento. */
const ENCHANT_MULTIPLIER = 6;

/** Recursos de crafteo por categoría de equipo. */
const RESOURCE_COUNT: Record<ItemCategory, number> = {
  'weapon-1h': 16,
  'weapon-2h': 32,
  armor: 16,
  head: 8,
  shoes: 8,
  bag: 32, // 192 materiales de encantamiento por nivel
  cape: 16, // 96 materiales por nivel
};

/** Materiales de encantamiento por nivel objetivo (1=Runa, 2=Alma, 3=Reliquia). */
const MATERIAL: Record<number, 'RUNE' | 'SOUL' | 'RELIC'> = {
  1: 'RUNE',
  2: 'SOUL',
  3: 'RELIC',
};

/** Cantidad de material necesaria para subir un nivel un item de esta categoría. */
export function enchantQty(category: ItemCategory): number {
  return RESOURCE_COUNT[category] * ENCHANT_MULTIPLIER;
}

/** Id AODP del material para subir a `level` en un item de tier `tier` (T6_SOUL). */
export function enchantMaterialId(tier: number, level: number): string {
  return `T${tier}_${MATERIAL[level]}`;
}

/** Ids de todos los materiales de encantamiento (runa/alma/reliquia) de un tier. */
export function enchantMaterialIds(tier: number): string[] {
  return [1, 2, 3].map((lvl) => enchantMaterialId(tier, lvl));
}
