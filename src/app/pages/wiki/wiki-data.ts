export interface WikiItemDef {
  itemId: string;
  name: string;
  tier: number;
  folder: string;
}

const CROP_FOLDERS: { folder: string; harvestId: string; seedId: string; name: string; tier: number }[] = [
  { folder: 'T1_Zanahoria', harvestId: 'T1_CARROT', seedId: 'T1_FARM_CARROT_SEED', name: 'Zanahoria', tier: 1 },
  { folder: 'T2_Frijoles', harvestId: 'T2_BEAN', seedId: 'T2_FARM_BEAN_SEED', name: 'Frijoles', tier: 2 },
  { folder: 'T3_Trigo', harvestId: 'T3_WHEAT', seedId: 'T3_FARM_WHEAT_SEED', name: 'Trigo', tier: 3 },
  { folder: 'T4_Rabano', harvestId: 'T4_TURNIP', seedId: 'T4_FARM_TURNIP_SEED', name: 'Rábano', tier: 4 },
  { folder: 'T5_Col', harvestId: 'T5_CABBAGE', seedId: 'T5_FARM_CABBAGE_SEED', name: 'Col', tier: 5 },
  { folder: 'T6_Patata', harvestId: 'T6_POTATO', seedId: 'T6_FARM_POTATO_SEED', name: 'Patata', tier: 6 },
  { folder: 'T7_Maiz', harvestId: 'T7_CORN', seedId: 'T7_FARM_CORN_SEED', name: 'Maíz', tier: 7 },
  { folder: 'T8_Calabaza', harvestId: 'T8_PUMPKIN', seedId: 'T8_FARM_PUMPKIN_SEED', name: 'Calabaza', tier: 8 },
];

const HERB_FOLDERS: { folder: string; harvestId: string; seedId: string; name: string; tier: number }[] = [
  { folder: 'T2_Agarico_Arcano', harvestId: 'T2_AGARIC', seedId: 'T2_FARM_AGARIC_SEED', name: 'Agárico arcano', tier: 2 },
  { folder: 'T3_Consuelda_Hojabrillante', harvestId: 'T3_COMFREY', seedId: 'T3_FARM_COMFREY_SEED', name: 'Consuelda hojabrillante', tier: 3 },
  { folder: 'T4_Bardana_Almenada', harvestId: 'T4_BURDOCK', seedId: 'T4_FARM_BURDOCK_SEED', name: 'Bardana almenada', tier: 4 },
  { folder: 'T5_Cardo_Dragon', harvestId: 'T5_TEASEL', seedId: 'T5_FARM_TEASEL_SEED', name: 'Cardo de dragón', tier: 5 },
  { folder: 'T6_Dedalera_Elusiva', harvestId: 'T6_FOXGLOVE', seedId: 'T6_FARM_FOXGLOVE_SEED', name: 'Dedalera elusiva', tier: 6 },
  { folder: 'T7_Gordolobo_Igneo', harvestId: 'T7_MULLEIN', seedId: 'T7_FARM_MULLEIN_SEED', name: 'Gordolobo ígneo', tier: 7 },
  { folder: 'T8_Milenrama_Demoniaca', harvestId: 'T8_YARROW', seedId: 'T8_FARM_YARROW_SEED', name: 'Milenrama demoníaca', tier: 8 },
];

export function lookupItem(section: string, category: string, folder: string): WikiItemDef | null {
  const items = category === 'agricultor' ? CROP_FOLDERS : HERB_FOLDERS;
  const isSeed = section === 'semillas';
  const baseFolder = isSeed ? folder.replace(/^Semilla_/, '') : folder;
  const entry = items.find((i) => i.folder === baseFolder);
  if (!entry) return null;

  if (isSeed) {
    return { itemId: entry.seedId, name: `Semilla de ${entry.name}`, tier: entry.tier, folder };
  }
  return { itemId: entry.harvestId, name: entry.name, tier: entry.tier, folder };
}

export const ALL_CROP_FOLDERS = CROP_FOLDERS;
export const ALL_HERB_FOLDERS = HERB_FOLDERS;

const folderByHarvestId: Record<string, string> = {};
for (const f of [...CROP_FOLDERS, ...HERB_FOLDERS]) {
  folderByHarvestId[f.harvestId] = f.folder;
}

export function harvestIdToFolder(harvestId: string): string {
  return folderByHarvestId[harvestId] ?? '';
}
