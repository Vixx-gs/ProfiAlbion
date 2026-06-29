import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T5_Col',
  harvestId: 'T5_CABBAGE',
  seedId: 'T5_FARM_CABBAGE_SEED',
  name: 'Col',
  tier: 5,
  usageInfo: {
    seedImageItemId: 'T5_FARM_CABBAGE_SEED',
    description: 'Se recolecta de la semilla de col',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Las Col se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T5_MEAL_SOUP', name: 'Sopa de col' },
    { itemId: 'T5_MEAL_SOUP_FISH', name: 'Sopa de almeja de pantano negro' },
    { itemId: 'T6_MEAL_SALAD', name: 'Ensalada de patata' },
    { itemId: 'T5_MEAL_PIE', name: 'Pastel de ganso' },
    { itemId: 'T5_MEAL_PIE_FISH', name: 'Pastel de ojo muerto de las montañas' },
    { itemId: 'T5_MEAL_OMELETTE', name: 'Tortilla de ganso' },
    { itemId: 'T5_MEAL_OMELETTE_FISH', name: 'Tortilla de cangrejo de río' },
    { itemId: 'T6_MEAL_STEW_AVALON', name: 'Guiso de cordero avaloniano' },
    { itemId: 'T5_MEAL_ROAST', name: 'Ganso asado' },
    { itemId: 'T5_MEAL_ROAST_FISH', name: 'Pargo de niebla ligera asado' },
  ],
};
