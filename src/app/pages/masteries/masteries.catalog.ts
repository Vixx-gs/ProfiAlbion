/** Definición de una maestría: nombre en español, icono de Albion y nivel máximo. */
export interface MasteryDef {
  /** Clave estable para guardar el nivel (no cambia aunque se traduzca la etiqueta). */
  key: string;
  label: string;
  iconId: string;
  maxLevel: number;
}

/** Catálogo completo de maestrías obtenibles, en el mismo orden que en el juego. */
export const MASTERIES_CATALOG: MasteryDef[] = [
  // Refinado y otras profesiones
  { key: 'alchemy', label: 'Alquimia', iconId: 'T8_POTION_LAVA', maxLevel: 1500 },
  { key: 'cooking', label: 'Cocina', iconId: 'T8_MEAL_STEW', maxLevel: 900 },
  { key: 'animal_breeder', label: 'Criador de animales', iconId: 'T8_FARM_OX_GROWN', maxLevel: 900 },
  { key: 'crop_farmer', label: 'Agricultor', iconId: 'T8_PUMPKIN', maxLevel: 800 },
  { key: 'herbalist', label: 'Herbolario', iconId: 'T8_BAG_INSIGHT', maxLevel: 700 },
  { key: 'fiber_weaver', label: 'Tejedor de fibra', iconId: 'T8_JOURNAL_FIBER', maxLevel: 500 },
  { key: 'ore_smelter', label: 'Fundidor de mineral', iconId: 'T8_JOURNAL_ORE', maxLevel: 500 },
  { key: 'hide_tanner', label: 'Curtidor de pieles', iconId: 'T8_JOURNAL_HIDE', maxLevel: 500 },
  { key: 'wood_planer', label: 'Carpintero', iconId: 'T8_JOURNAL_WOOD', maxLevel: 500 },
  { key: 'stone_cutter', label: 'Cantero', iconId: 'T8_JOURNAL_STONE', maxLevel: 500 },

  // Artesanos de herramientas de recolección
  { key: 'harvester_crafter', label: 'Artesano de hoz', iconId: 'T8_2H_TOOL_SICKLE', maxLevel: 300 },
  { key: 'skinner_crafter', label: 'Artesano de cuchillo de desollar', iconId: 'T8_2H_TOOL_KNIFE', maxLevel: 300 },
  { key: 'miner_crafter', label: 'Artesano de pico de minero', iconId: 'T8_2H_TOOL_PICK', maxLevel: 300 },
  { key: 'quarrier_crafter', label: 'Artesano de martillo de cantero', iconId: 'T8_2H_TOOL_HAMMER', maxLevel: 300 },
  { key: 'lumberjack_crafter', label: 'Artesano de hacha de leñador', iconId: 'T8_2H_TOOL_AXE', maxLevel: 300 },
  { key: 'fisherman_crafter', label: 'Artesano de caña de pescar', iconId: 'T8_2H_TOOL_FISHINGROD', maxLevel: 300 },

  // Artesanos de armadura de placas
  { key: 'plate_boots_crafter', label: 'Artesano de botas de placas', iconId: 'T8_SHOES_PLATE_SET1', maxLevel: 800 },
  { key: 'plate_armor_crafter', label: 'Artesano de armadura de placas', iconId: 'T8_ARMOR_PLATE_SET1', maxLevel: 800 },
  { key: 'plate_helmet_crafter', label: 'Artesano de casco de placas', iconId: 'T8_HEAD_PLATE_SET1', maxLevel: 800 },

  // Artesanos de armas
  { key: 'sword_crafter', label: 'Artesano de espadas', iconId: 'T8_MAIN_SWORD', maxLevel: 800 },
  { key: 'battleaxe_crafter', label: 'Artesano de hachas de batalla', iconId: 'T8_2H_AXE', maxLevel: 800 },
  { key: 'mace_crafter', label: 'Artesano de mazas', iconId: 'T8_MAIN_MACE', maxLevel: 800 },
  { key: 'hammer_crafter', label: 'Artesano de martillos', iconId: 'T8_MAIN_HAMMER', maxLevel: 800 },
  { key: 'war_gloves_crafter', label: 'Artesano de guantes de guerra', iconId: 'T8_2H_KNUCKLES_SET1', maxLevel: 800 },
  { key: 'crossbow_crafter', label: 'Artesano de ballestas', iconId: 'T8_2H_CROSSBOW', maxLevel: 800 },
  { key: 'shield_crafter', label: 'Artesano de escudos', iconId: 'T8_OFF_SHIELD', maxLevel: 600 },
  { key: 'leather_shoes_crafter', label: 'Artesano de zapatos de cuero', iconId: 'T8_SHOES_LEATHER_SET1', maxLevel: 800 },
  { key: 'leather_jacket_crafter', label: 'Artesano de chaqueta de cuero', iconId: 'T8_ARMOR_LEATHER_SET1', maxLevel: 800 },
  { key: 'leather_hood_crafter', label: 'Artesano de capucha de cuero', iconId: 'T8_HEAD_LEATHER_SET1', maxLevel: 800 },
  { key: 'bow_crafter', label: 'Artesano de arcos', iconId: 'T8_2H_BOW', maxLevel: 800 },
  { key: 'spear_crafter', label: 'Artesano de lanzas', iconId: 'T8_MAIN_SPEAR', maxLevel: 800 },
  { key: 'nature_staff_crafter', label: 'Artesano de bastón de naturaleza', iconId: 'T8_MAIN_NATURESTAFF', maxLevel: 800 },
  { key: 'dagger_crafter', label: 'Artesano de dagas', iconId: 'T8_MAIN_DAGGER', maxLevel: 800 },
  { key: 'quarterstaff_crafter', label: 'Artesano de bastón largo', iconId: 'T8_2H_QUARTERSTAFF', maxLevel: 800 },
  { key: 'shapeshifter_crafter', label: 'Artesano de bastón metamorfo', iconId: 'T8_2H_SHAPESHIFTER_SET1', maxLevel: 800 },
  { key: 'torch_crafter', label: 'Artesano de antorchas', iconId: 'T8_OFF_TORCH', maxLevel: 600 },
  { key: 'cloth_sandals_crafter', label: 'Artesano de sandalias de tela', iconId: 'T8_SHOES_CLOTH_SET1', maxLevel: 800 },
  { key: 'cloth_robe_crafter', label: 'Artesano de túnica de tela', iconId: 'T8_ARMOR_CLOTH_SET1', maxLevel: 800 },
  { key: 'cloth_cowl_crafter', label: 'Artesano de capucha de tela', iconId: 'T8_HEAD_CLOTH_SET1', maxLevel: 800 },
  { key: 'fire_staff_crafter', label: 'Artesano de bastón de fuego', iconId: 'T8_MAIN_FIRESTAFF', maxLevel: 800 },
  { key: 'holy_staff_crafter', label: 'Artesano de bastón sagrado', iconId: 'T8_MAIN_HOLYSTAFF', maxLevel: 800 },
  { key: 'arcane_staff_crafter', label: 'Artesano de bastón arcano', iconId: 'T8_MAIN_ARCANESTAFF', maxLevel: 800 },
  { key: 'frost_staff_crafter', label: 'Artesano de bastón de escarcha', iconId: 'T8_MAIN_FROSTSTAFF', maxLevel: 800 },
  { key: 'cursed_staff_crafter', label: 'Artesano de bastón maldito', iconId: 'T8_MAIN_CURSEDSTAFF', maxLevel: 800 },
  { key: 'tome_crafter', label: 'Artesano de tomos', iconId: 'T8_OFF_BOOK', maxLevel: 600 },
];
