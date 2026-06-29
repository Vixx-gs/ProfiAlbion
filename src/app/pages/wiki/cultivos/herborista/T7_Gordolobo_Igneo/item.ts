import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T7_Gordolobo_Igneo',
  harvestId: 'T7_MULLEIN',
  seedId: 'T7_FARM_MULLEIN_SEED',
  name: 'Gordolobo ígneo',
  tier: 7,
  usageInfo: {
    seedImageItemId: 'T7_FARM_MULLEIN_SEED',
    description: 'Se recolecta de la semilla de gordolobo ígneo',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T7_POTION_MOB_RESET', name: 'Poción de calma mayor' },
    { itemId: 'T5_POTION_MOB_RESET', name: 'Poción de calma' },
    { itemId: 'T7_POTION_CLEANSE2', name: 'Poción de purga mayor' },
    { itemId: 'T5_POTION_CLEANSE2', name: 'Poción de purga' },
    { itemId: 'T7_POTION_ACID', name: 'Poción de ácido mayor' },
    { itemId: 'T5_POTION_ACID', name: 'Poción de ácido' },
    { itemId: 'T7_POTION_REVIVE', name: 'Poción de gigantismo mayor' },
    { itemId: 'T5_POTION_REVIVE', name: 'Poción de gigantismo' },
    { itemId: 'T7_POTION_STONESKIN', name: 'Poción de resistencia mayor' },
    { itemId: 'T5_POTION_STONESKIN', name: 'Poción de resistencia' },
    { itemId: 'T7_POTION_SLOWFIELD', name: 'Poción de pegajosa mayor' },
    { itemId: 'T5_POTION_SLOWFIELD', name: 'Poción de pegajosa' },
    { itemId: 'T6_POTION_HEAL', name: 'Poción de curación mayor' },
    { itemId: 'T6_POTION_ENERGY', name: 'Poción de energía mayor' },
  ],
};
