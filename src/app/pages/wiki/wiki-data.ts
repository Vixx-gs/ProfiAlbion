import { CROP_FOLDERS as HARVEST_CROPS, HERB_FOLDERS as HARVEST_HERBS } from './cultivos/cultivos-data';
import { CROP_FOLDERS as SEED_CROPS, HERB_FOLDERS as SEED_HERBS } from './semillas/semillas-data';
import type { ItemData, DropEntry, UsageInfo, CraftableItem } from './wiki-types';

export interface WikiItemDef {
  itemId: string;
  name: string;
  tier: number;
  folder: string;
  harvestId: string;
  seedId: string;
  growHours?: number;
  focusBonus?: number;
  focusCost?: number;
  seedsPerHarvest?: number;
  defaultSeedPrice?: number;
  yieldPerHarvest?: number;
  moreInfo?: string[];
  drops?: DropEntry[];
  usageInfo?: UsageInfo;
  craftableItems?: CraftableItem[];
}

export function lookupItem(section: string, category: string, folder: string): WikiItemDef | null {
  const isSeed = section === 'semillas';
  const cropArr = isSeed ? SEED_CROPS : HARVEST_CROPS;
  const herbArr = isSeed ? SEED_HERBS : HARVEST_HERBS;
  const items = category === 'agricultor' ? cropArr : herbArr;
  const entry = items.find((i) => i.folder === folder);
  if (!entry) return null;

  const extra = {
    growHours: entry.growHours,
    focusBonus: entry.focusBonus,
    focusCost: entry.focusCost,
    seedsPerHarvest: entry.seedsPerHarvest,
    defaultSeedPrice: entry.defaultSeedPrice,
    yieldPerHarvest: entry.yieldPerHarvest,
    moreInfo: entry.moreInfo,
    drops: entry.drops,
    usageInfo: entry.usageInfo,
    craftableItems: entry.craftableItems,
  };
  if (isSeed) {
    return {
      itemId: entry.seedId,
      name: `Semilla de ${entry.name}`,
      tier: entry.tier,
      folder,
      harvestId: entry.harvestId,
      seedId: entry.seedId,
      ...extra,
    };
  }
  return {
    itemId: entry.harvestId,
    name: entry.name,
    tier: entry.tier,
    folder,
    harvestId: entry.harvestId,
    seedId: entry.seedId,
    ...extra,
  };
}

export const ALL_CROP_FOLDERS = HARVEST_CROPS;
export const ALL_HERB_FOLDERS = HARVEST_HERBS;

const folderByHarvestId: Record<string, string> = {};
for (const f of [...HARVEST_CROPS, ...HARVEST_HERBS]) {
  folderByHarvestId[f.harvestId] = f.folder;
}

export function harvestIdToFolder(harvestId: string): string {
  return folderByHarvestId[harvestId] ?? '';
}
