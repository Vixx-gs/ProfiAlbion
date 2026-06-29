import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T7_Maiz',
  harvestId: 'T7_CORN',
  seedId: 'T7_FARM_CORN_SEED',
  name: 'Maíz',
  tier: 7,
  usageInfo: {
    seedImageItemId: 'T7_FARM_CORN_SEED',
    description: 'Se recolecta de la semilla de maíz',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Los Maíces se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T7_MEAL_PIE', name: 'Pastel de cerdo' },
    { itemId: 'T7_MEAL_PIE_FISH', name: 'Pastel de ojo muerto dos picos' },
    { itemId: 'T7_MEAL_OMELETTE', name: 'Tortilla de cerdo' },
    { itemId: 'T7_MEAL_OMELETTE_FISH', name: 'Tortilla de cangrejo de pozo' },
    { itemId: 'T8_MEAL_STEW_AVALON', name: 'Guiso de ternera avaloniano' },
    { itemId: 'T7_MEAL_ROAST', name: 'Cerdo asado' },
    { itemId: 'T7_MEAL_ROAST_FISH', name: 'Pargo de niebla pura asado' },
    { itemId: 'T7_ALCOHOL', name: 'Orujo de maíz' },
  ],
};
