import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T1_Zanahoria',
  harvestId: 'T1_CARROT',
  seedId: 'T1_FARM_CARROT_SEED',
  name: 'Zanahoria',
  tier: 1,
  usageInfo: {
    seedImageItemId: 'T1_FARM_CARROT_SEED',
    description: 'Se recolecta de la semilla de zanahoria',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Las zanahorias se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T1_MEAL_SOUP', name: 'Sopa de zanahoria' },
    { itemId: 'T1_MEAL_SOUP_FISH', name: 'Sopa de almeja verdosa' },
    { itemId: 'T2_MEAL_SALAD', name: 'Ensalada de frijoles' },
    { itemId: 'T8_MEAL_STEW_AVALON', name: 'Guiso de cabra avaloniano' },
  ],
};



