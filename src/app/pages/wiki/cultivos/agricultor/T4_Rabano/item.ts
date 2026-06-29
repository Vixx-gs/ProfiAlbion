import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T4_Rabano',
  harvestId: 'T4_TURNIP',
  seedId: 'T4_FARM_TURNIP_SEED',
  name: 'Rábano',
  tier: 4,
  usageInfo: {
    seedImageItemId: 'T4_FARM_TURNIP_SEED',
    description: 'Se recolecta de la semilla de rábano',
    points: [
      'Se puede utilizar para alimentar Escondites, territorios, trabajadores y animales de granja',
      'Proporciona 48 puntos de nutrición',
      'Los Rábanos se pueden cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T4_MEAL_SALAD', name: 'Ensalada de rábano' },
    { itemId: 'T4_MEAL_SALAD_FISH', name: 'Ensalada de pulpo de aguas medias' },
    { itemId: 'T4_MEAL_STEW', name: 'Guiso de cabra' },
    { itemId: 'T4_MEAL_STEW_FISH', name: 'Guiso de anguila de agua verdosa' },
    { itemId: 'T4_MEAL_STEW_AVALON', name: 'Guiso de cabra avaloniano' },
    { itemId: 'T4_MEAL_SANDWICH_FISH', name: 'Bocadillo de locha pedregosa' },
  ],
};
