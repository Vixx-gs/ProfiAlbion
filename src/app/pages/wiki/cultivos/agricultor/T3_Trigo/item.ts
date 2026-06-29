import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T3_Trigo',
  harvestId: 'T3_WHEAT',
  seedId: 'T3_FARM_WHEAT_SEED',
  name: 'Trigo',
  tier: 3,
  usageInfo: {
    seedImageItemId: 'T3_FARM_WHEAT_SEED',
    description: 'Se recolecta de la semilla de trigo',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Los Trigo se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T3_MEAL_SOUP', name: 'Sopa de trigo' },
    { itemId: 'T3_MEAL_SOUP_FISH', name: 'Sopa de almeja de aguas turbias' },
    { itemId: 'T4_MEAL_SALAD', name: 'Ensalada de rábano' },
    { itemId: 'T3_MEAL_PIE', name: 'Pastel de pollo' },
    { itemId: 'T3_MEAL_OMELETTE', name: 'Tortilla de pollo' },
    { itemId: 'T3_FLOUR', name: 'Harina' },
  ],
};
