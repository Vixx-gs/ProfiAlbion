import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T8_Calabaza',
  harvestId: 'T8_PUMPKIN',
  seedId: 'T8_FARM_PUMPKIN_SEED',
  name: 'Calabaza',
  tier: 8,
  usageInfo: {
    seedImageItemId: 'T8_FARM_PUMPKIN_SEED',
    description: 'Se recolecta de la semilla de calabaza',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Las Calabazas se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T8_MEAL_STEW', name: 'Guiso de ternera' },
    { itemId: 'T8_MEAL_STEW_FISH', name: 'Guiso de anguila de agua podrida' },
    { itemId: 'T8_MEAL_STEW_AVALON', name: 'Guiso de ternera avaloniano' },
    { itemId: 'T8_MEAL_SANDWICH_FISH', name: 'Bocadillo de locha de trueno' },
    { itemId: 'T8_ALCOHOL', name: 'Aguardiente de calabaza' },
  ],
};
