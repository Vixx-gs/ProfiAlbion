import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T8_Milenrama_Demoniaca',
  harvestId: 'T8_YARROW',
  seedId: 'T8_FARM_YARROW_SEED',
  name: 'Milenrama demoníaca',
  tier: 8,
  usageInfo: {
    seedImageItemId: 'T8_FARM_YARROW_SEED',
    description: 'Se recolecta de la semilla de milenrama demoníaca',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T8_POTION_COOLDOWN', name: 'Poción de calma excelsia' },
    { itemId: 'T8_POTION_BERSERK', name: 'Poción de berserker excelsia' },
    { itemId: 'T8_POTION_LAVA', name: 'Poción de lava excelsia' },
    { itemId: 'T8_POTION_TORNADO', name: 'Poción de tornado excelsia' },
    { itemId: 'T8_POTION_GATHER', name: 'Poción de recolección mayor' },
    { itemId: 'T8_POTION_CLEANSE', name: 'Poción de invisibilidad' },
    { itemId: 'T6_POTION_HEAL', name: 'Poción de curación mayor' },
    { itemId: 'T6_POTION_ENERGY', name: 'Poción de energía mayor' },
  ],
};
