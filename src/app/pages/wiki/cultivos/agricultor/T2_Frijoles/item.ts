import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T2_Frijoles',
  harvestId: 'T2_BEAN',
  seedId: 'T2_FARM_BEAN_SEED',
  name: 'Frijoles',
  tier: 2,
  usageInfo: {
    seedImageItemId: 'T2_FARM_BEAN_SEED',
    description: 'Se recolecta de la semilla de frijoles',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Los Frijoles se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T2_MEAL_SALAD', name: 'Ensalada de frijoles' },
    { itemId: 'T2_MEAL_SALAD_FISH', name: 'Ensalada de calamar de aguas poco profundas' },
    { itemId: 'T3_MEAL_ROAST', name: 'Pollo asado' },
  ],
};
