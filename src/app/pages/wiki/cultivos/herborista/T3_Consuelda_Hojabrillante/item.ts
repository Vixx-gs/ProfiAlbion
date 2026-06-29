import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'T3_Consuelda_Hojabrillante',
  harvestId: 'T3_COMFREY',
  seedId: 'T3_FARM_COMFREY_SEED',
  name: 'Consuelda hojabrillante',
  tier: 3,
  usageInfo: {
    seedImageItemId: 'T3_FARM_COMFREY_SEED',
    description: 'Se recolecta de la semilla de consuelda hojabrillante',
    points: [
      'Se utiliza para crear pociones en el Alquimista',
      'Proporciona 48 puntos de nutrición',
      'Se puede cosechar cada 22h',
    ],
  },
  craftableItems: [
    { itemId: 'T3_POTION_REVIVE', name: 'Poción de gigantismo menor' },
    { itemId: 'T3_POTION_STONESKIN', name: 'Poción de resistencia menor' },
    { itemId: 'T3_POTION_MOB_RESET', name: 'Poción de calma menor' },
    { itemId: 'T5_POTION_MOB_RESET', name: 'Poción de calma' },
    { itemId: 'T7_POTION_MOB_RESET', name: 'Poción de calma mayor' },
    { itemId: 'T3_POTION_CLEANSE2', name: 'Poción de purga menor' },
    { itemId: 'T5_POTION_CLEANSE2', name: 'Poción de purga' },
    { itemId: 'T7_POTION_CLEANSE2', name: 'Poción de purga mayor' },
    { itemId: 'T3_POTION_ACID', name: 'Poción de ácido menor' },
    { itemId: 'T5_POTION_ACID', name: 'Poción de ácido' },
    { itemId: 'T7_POTION_ACID', name: 'Poción de ácido mayor' },
    { itemId: 'T4_POTION_HEAL', name: 'Poción de curación' },
    { itemId: 'T4_POTION_ENERGY', name: 'Poción de energía' },
    { itemId: 'T5_POTION_REVIVE', name: 'Poción de gigantismo' },
    { itemId: 'T7_POTION_REVIVE', name: 'Poción de gigantismo mayor' },
  ],
};
