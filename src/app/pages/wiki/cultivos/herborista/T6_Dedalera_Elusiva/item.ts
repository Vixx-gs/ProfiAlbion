import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T6_Dedalera_Elusiva',
  harvestId: 'T6_FOXGLOVE',
  seedId: 'T6_FARM_FOXGLOVE_SEED',
  name: 'Dedalera elusiva',
  tier: 6,
  usageInfo: {
    seedImageItemId: 'T6_FARM_FOXGLOVE_SEED',
    description: 'Se recolecta de la semilla de dedalera elusiva',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T6_POTION_COOLDOWN', name: 'Poción de calma mayor' },
    { itemId: 'T8_POTION_COOLDOWN', name: 'Poción de calma excelsia' },
    { itemId: 'T6_POTION_BERSERK', name: 'Poción de berserker mayor' },
    { itemId: 'T8_POTION_BERSERK', name: 'Poción de berserker excelsia' },
    { itemId: 'T6_POTION_LAVA', name: 'Poción de lava mayor' },
    { itemId: 'T8_POTION_LAVA', name: 'Poción de lava excelsia' },
    { itemId: 'T6_POTION_TORNADO', name: 'Poción de tornado mayor' },
    { itemId: 'T8_POTION_TORNADO', name: 'Poción de tornado excelsia' },
    { itemId: 'T4_POTION_COOLDOWN', name: 'Poción de calma' },
    { itemId: 'T4_POTION_BERSERK', name: 'Poción de berserker' },
    { itemId: 'T4_POTION_LAVA', name: 'Poción de lava' },
    { itemId: 'T4_POTION_TORNADO', name: 'Poción de tornado' },
    { itemId: 'T6_POTION_HEAL', name: 'Poción de curación mayor' },
    { itemId: 'T6_POTION_ENERGY', name: 'Poción de energía mayor' },
    { itemId: 'T6_POTION_GATHER', name: 'Poción de recolección' },
    { itemId: 'T8_POTION_GATHER', name: 'Poción de recolección mayor' },
  ],
};
