import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T6_Patata',
  harvestId: 'T6_POTATO',
  seedId: 'T6_FARM_POTATO_SEED',
  name: 'Patata',
  tier: 6,
  usageInfo: {
    seedImageItemId: 'T6_FARM_POTATO_SEED',
    description: 'Se recolecta de la semilla de patata',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Las Patatas se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T6_MEAL_SALAD', name: 'Ensalada de patata' },
    { itemId: 'T6_MEAL_SALAD_FISH', name: 'Ensalada de kraken de agua profunda' },
    { itemId: 'T6_MEAL_STEW', name: 'Guiso de carnero' },
    { itemId: 'T6_MEAL_STEW_FISH', name: 'Guiso de anguila rojiza' },
    { itemId: 'T6_MEAL_STEW_AVALON', name: 'Guiso de cordero avaloniano' },
    { itemId: 'T6_MEAL_SANDWICH_FISH', name: 'Bocadillo de locha de agua corriente' },
    { itemId: 'T6_ALCOHOL', name: 'Schnapps de patata' },
  ],
};
