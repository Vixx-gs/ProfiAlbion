/** Definición de una maestría: nombre en español, icono de Albion y nivel máximo. */
export interface MasteryDef {
  /** Clave estable para guardar el nivel (no cambia aunque se traduzca la etiqueta). */
  key: string;
  label: string;
  iconId: string;
  maxLevel: number;
  /** Sub-maestrías dentro de esta categoría (cada una con su propio nivel 0-100). */
  subMasteries?: MasteryDef[];
}

/** Sub-maestrías de Alquimia (cada elaborador tiene su propio nivel, máx. 100). */
const ALCHEMY_SUB_MASTERIES: MasteryDef[] = [
  { key: 'alchemist_mastery', label: 'Alquimia', iconId: 'T1_ALCHEMY_EXTRACT_LEVEL3', maxLevel: 100 },
  { key: 'heal_brewer', label: 'Curación', iconId: 'T4_POTION_HEAL', maxLevel: 100 },
  { key: 'energy_brewer', label: 'Energía', iconId: 'T4_POTION_ENERGY', maxLevel: 100 },
  { key: 'gigantify_brewer', label: 'Gigantismo', iconId: 'T7_POTION_REVIVE', maxLevel: 100 },
  { key: 'resistance_brewer', label: 'Resistencia', iconId: 'T7_POTION_STONESKIN', maxLevel: 100 },
  { key: 'sticky_brewer', label: 'Pegajosas', iconId: 'T5_POTION_SLOWFIELD', maxLevel: 100 },
  { key: 'poison_brewer', label: 'Venenosas', iconId: 'T6_POTION_COOLDOWN', maxLevel: 100 },
  { key: 'invisibility_brewer', label: 'Invisibilidad', iconId: 'T8_POTION_CLEANSE', maxLevel: 100 },
  { key: 'calming_brewer', label: 'Calmantes', iconId: 'T5_POTION_MOB_RESET', maxLevel: 100 },
  { key: 'cleansing_brewer', label: 'Purificantes', iconId: 'T5_POTION_CLEANSE2', maxLevel: 100 },
  { key: 'acid_brewer', label: 'Ácidas', iconId: 'T5_POTION_ACID', maxLevel: 100 },
  { key: 'berserk_brewer', label: 'Furia', iconId: 'T6_POTION_BERSERK', maxLevel: 100 },
  { key: 'hellfire_brewer', label: 'Fuego Infernal', iconId: 'T6_POTION_LAVA', maxLevel: 100 },
  { key: 'gathering_brewer', label: 'Recolección', iconId: 'T6_POTION_GATHER', maxLevel: 100 },
  { key: 'tornado_brewer', label: 'Tornado', iconId: 'T6_POTION_TORNADO', maxLevel: 100 },
  { key: 'bootlegger', label: 'Alcohol', iconId: 'T8_ALCOHOL', maxLevel: 100 },
];

/** Sub-maestrías de Ganadero. */
const BREEDER_SUB_MASTERIES: MasteryDef[] = [
  { key: 'breeder_mastery', label: 'Ganadero', iconId: 'T4_FARM_OX_GROWN', maxLevel: 100 },
  { key: 'sheep', label: 'Ovejas', iconId: 'T6_FARM_SHEEP_GROWN', maxLevel: 100 },
  { key: 'pig', label: 'Cerdos', iconId: 'T7_FARM_PIG_GROWN', maxLevel: 100 },
  { key: 'cow', label: 'Vacas', iconId: 'T8_FARM_COW_GROWN', maxLevel: 100 },
  { key: 'horse', label: 'Caballos', iconId: 'T8_FARM_HORSE_GROWN', maxLevel: 100 },
  { key: 'ox', label: 'Bueyes', iconId: 'T8_FARM_OX_GROWN', maxLevel: 100 },
  { key: 'chicken', label: 'Gallinas', iconId: 'T3_FARM_CHICKEN_GROWN', maxLevel: 100 },
  { key: 'goat', label: 'Cabras', iconId: 'T4_FARM_GOAT_GROWN', maxLevel: 100 },
  { key: 'goose', label: 'Gansos', iconId: 'T5_FARM_GOOSE_GROWN', maxLevel: 100 },
  { key: 'rare', label: 'Animales Raros', iconId: 'T8_FARM_DIREWOLF_GROWN', maxLevel: 100 },
];

/** Sub-maestrías de Cocina. */
const COOKING_SUB_MASTERIES: MasteryDef[] = [
  { key: 'chef', label: 'Chef', iconId: 'T4_MEAL_STEW', maxLevel: 100 },
  { key: 'omelette', label: 'Tortilla', iconId: 'T7_MEAL_OMELETTE', maxLevel: 100 },
  { key: 'pie', label: 'Pastel', iconId: 'T7_MEAL_PIE', maxLevel: 100 },
  { key: 'salad', label: 'Ensalada', iconId: 'T6_MEAL_SALAD', maxLevel: 100 },
  { key: 'sandwich', label: 'Sándwich', iconId: 'T8_MEAL_SANDWICH', maxLevel: 100 },
  { key: 'soup', label: 'Sopa', iconId: 'T5_MEAL_SOUP', maxLevel: 100 },
  { key: 'stew', label: 'Estofado', iconId: 'T8_MEAL_STEW', maxLevel: 100 },
  { key: 'roast', label: 'Asado', iconId: 'T7_MEAL_ROAST', maxLevel: 100 },
  { key: 'harvester', label: 'Ingrediente', iconId: 'T3_FLOUR', maxLevel: 100 },
];

/** Catálogo completo de maestrías obtenibles, en el mismo orden que en el juego. */
export const MASTERIES_CATALOG: MasteryDef[] = [
  // Refinado y otras profesiones
  {
    key: 'alchemy',
    label: 'Alquimia',
    iconId: 'T6_POTION_HEAL',
    maxLevel: 1500,
    subMasteries: ALCHEMY_SUB_MASTERIES,
  },
  { key: 'cooking', label: 'Cocina', iconId: 'T8_MEAL_STEW', maxLevel: 800, subMasteries: COOKING_SUB_MASTERIES },
  { key: 'animal_breeder', label: 'Ganadero', iconId: 'T3_FARM_HORSE_GROWN', maxLevel: 900, subMasteries: BREEDER_SUB_MASTERIES },
  {
    key: 'crop_farmer',
    label: 'Agricultor',
    iconId: 'T1_CARROT',
    maxLevel: 800,
    subMasteries: [
      { key: 'crop_farmer_mastery', label: 'Agricultor', iconId: 'T1_CARROT', maxLevel: 100 },
      { key: 'carrot', label: 'Zanahoria', iconId: 'T1_CARROT', maxLevel: 100 },
      { key: 'bean', label: 'Judía', iconId: 'T2_BEAN', maxLevel: 100 },
      { key: 'wheat', label: 'Trigo', iconId: 'T3_WHEAT', maxLevel: 100 },
      { key: 'turnip', label: 'Nabo', iconId: 'T4_TURNIP', maxLevel: 100 },
      { key: 'cabbage', label: 'Repollo', iconId: 'T5_CABBAGE', maxLevel: 100 },
      { key: 'potato', label: 'Patata', iconId: 'T6_POTATO', maxLevel: 100 },
      { key: 'corn', label: 'Maíz', iconId: 'T7_CORN', maxLevel: 100 },
      { key: 'pumpkin', label: 'Calabaza', iconId: 'T8_PUMPKIN', maxLevel: 100 },
    ],
  },
  {
    key: 'herbalist',
    label: 'Herbolario',
    iconId: 'T2_AGARIC',
    maxLevel: 700,
    subMasteries: [
      { key: 'herbalist_mastery', label: 'Herbolario', iconId: 'T2_AGARIC', maxLevel: 100 },
      { key: 'agaric', label: 'Agárico Arcano', iconId: 'T2_AGARIC', maxLevel: 100 },
      { key: 'comfrey', label: 'Consuelda Hoja Brillante', iconId: 'T3_COMFREY', maxLevel: 100 },
      { key: 'burdock', label: 'Bardana Crenellada', iconId: 'T4_BURDOCK', maxLevel: 100 },
      { key: 'teasel', label: 'Cardo Dragón', iconId: 'T5_TEASEL', maxLevel: 100 },
      { key: 'foxglove', label: 'Dedalera Elusiva', iconId: 'T6_FOXGLOVE', maxLevel: 100 },
      { key: 'mullein', label: 'Gordolobo de Fuego', iconId: 'T7_MULLEIN', maxLevel: 100 },
      { key: 'yarrow', label: 'Milenrama de Ghoul', iconId: 'T8_YARROW', maxLevel: 100 },
    ],
  },
  {
    key: 'fiber_weaver',
    label: 'Tejedor de fibra',
    iconId: 'T3_CLOTH',
    maxLevel: 500,
    subMasteries: [
      { key: 'fiber_t4', label: 'T4', iconId: 'T4_CLOTH', maxLevel: 100 },
      { key: 'fiber_t5', label: 'T5', iconId: 'T5_CLOTH', maxLevel: 100 },
      { key: 'fiber_t6', label: 'T6', iconId: 'T6_CLOTH', maxLevel: 100 },
      { key: 'fiber_t7', label: 'T7', iconId: 'T7_CLOTH', maxLevel: 100 },
      { key: 'fiber_t8', label: 'T8', iconId: 'T8_CLOTH', maxLevel: 100 },
    ],
  },
  {
    key: 'ore_smelter',
    label: 'Fundidor de mineral',
    iconId: 'T3_METALBAR',
    maxLevel: 500,
    subMasteries: [
      { key: 'ore_t4', label: 'T4', iconId: 'T4_METALBAR', maxLevel: 100 },
      { key: 'ore_t5', label: 'T5', iconId: 'T5_METALBAR', maxLevel: 100 },
      { key: 'ore_t6', label: 'T6', iconId: 'T6_METALBAR', maxLevel: 100 },
      { key: 'ore_t7', label: 'T7', iconId: 'T7_METALBAR', maxLevel: 100 },
      { key: 'ore_t8', label: 'T8', iconId: 'T8_METALBAR', maxLevel: 100 },
    ],
  },
  {
    key: 'hide_tanner',
    label: 'Curtidor de pieles',
    iconId: 'T3_LEATHER',
    maxLevel: 500,
    subMasteries: [
      { key: 'hide_t4', label: 'T4', iconId: 'T4_LEATHER', maxLevel: 100 },
      { key: 'hide_t5', label: 'T5', iconId: 'T5_LEATHER', maxLevel: 100 },
      { key: 'hide_t6', label: 'T6', iconId: 'T6_LEATHER', maxLevel: 100 },
      { key: 'hide_t7', label: 'T7', iconId: 'T7_LEATHER', maxLevel: 100 },
      { key: 'hide_t8', label: 'T8', iconId: 'T8_LEATHER', maxLevel: 100 },
    ],
  },
  {
    key: 'wood_planer',
    label: 'Carpintero',
    iconId: 'T3_PLANKS',
    maxLevel: 500,
    subMasteries: [
      { key: 'wood_t4', label: 'T4', iconId: 'T4_PLANKS', maxLevel: 100 },
      { key: 'wood_t5', label: 'T5', iconId: 'T5_PLANKS', maxLevel: 100 },
      { key: 'wood_t6', label: 'T6', iconId: 'T6_PLANKS', maxLevel: 100 },
      { key: 'wood_t7', label: 'T7', iconId: 'T7_PLANKS', maxLevel: 100 },
      { key: 'wood_t8', label: 'T8', iconId: 'T8_PLANKS', maxLevel: 100 },
    ],
  },
  {
    key: 'stone_cutter',
    label: 'Cantero',
    iconId: 'T3_STONEBLOCK',
    maxLevel: 500,
    subMasteries: [
      { key: 'stone_t4', label: 'T4', iconId: 'T4_STONEBLOCK', maxLevel: 100 },
      { key: 'stone_t5', label: 'T5', iconId: 'T5_STONEBLOCK', maxLevel: 100 },
      { key: 'stone_t6', label: 'T6', iconId: 'T6_STONEBLOCK', maxLevel: 100 },
      { key: 'stone_t7', label: 'T7', iconId: 'T7_STONEBLOCK', maxLevel: 100 },
      { key: 'stone_t8', label: 'T8', iconId: 'T8_STONEBLOCK', maxLevel: 100 },
    ],
  },

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
