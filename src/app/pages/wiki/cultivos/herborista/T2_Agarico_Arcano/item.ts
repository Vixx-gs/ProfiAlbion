import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T2_Agarico_Arcano',
  harvestId: 'T2_AGARIC',
  seedId: 'T2_FARM_AGARIC_SEED',
  name: 'Agárico arcano',
  tier: 2,
  usageInfo: {
    seedImageItemId: 'T2_FARM_AGARIC_SEED',
    description: 'Se recolecta de la semilla de agárico arcano',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T2_POTION_HEAL', name: 'Poción de curación menor' },
    { itemId: 'T2_POTION_ENERGY', name: 'Poción de energía menor' },
    { itemId: 'T4_POTION_COOLDOWN', name: 'Poción de calma' },
    { itemId: 'T6_POTION_COOLDOWN', name: 'Poción de calma mayor' },
    { itemId: 'T5_POTION_STONESKIN', name: 'Poción de berserker' },
    { itemId: 'T2_MEAL_SALAD_FISH', name: 'Ensalada de calamar de aguas poco profundas' },
  ],
};
