import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T4_Bardana_Almenada',
  harvestId: 'T4_BURDOCK',
  seedId: 'T4_FARM_BURDOCK_SEED',
  name: 'Bardana almenada',
  tier: 4,
  usageInfo: {
    seedImageItemId: 'T4_FARM_BURDOCK_SEED',
    description: 'Se recolecta de la semilla de bardana almenada',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T4_POTION_COOLDOWN', name: 'Poción de calma' },
    { itemId: 'T6_POTION_COOLDOWN', name: 'Poción de calma mayor' },
    { itemId: 'T8_POTION_COOLDOWN', name: 'Poción de calma excelsia' },
    { itemId: 'T4_POTION_BERSERK', name: 'Poción de berserker' },
    { itemId: 'T6_POTION_BERSERK', name: 'Poción de berserker mayor' },
    { itemId: 'T8_POTION_BERSERK', name: 'Poción de berserker excelsia' },
    { itemId: 'T4_POTION_LAVA', name: 'Poción de lava' },
    { itemId: 'T6_POTION_LAVA', name: 'Poción de lava mayor' },
    { itemId: 'T8_POTION_LAVA', name: 'Poción de lava excelsia' },
    { itemId: 'T4_POTION_HEAL', name: 'Poción de curación' },
    { itemId: 'T6_POTION_HEAL', name: 'Poción de curación mayor' },
    { itemId: 'T4_POTION_ENERGY', name: 'Poción de energía' },
    { itemId: 'T6_POTION_ENERGY', name: 'Poción de energía mayor' },
    { itemId: 'T6_POTION_GATHER', name: 'Poción de recolección' },
    { itemId: 'T8_POTION_GATHER', name: 'Poción de recolección mayor' },
  ],
};
