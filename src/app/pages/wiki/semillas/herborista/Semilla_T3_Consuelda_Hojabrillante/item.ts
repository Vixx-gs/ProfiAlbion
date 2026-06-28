import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T3_Consuelda_Hojabrillante',
  harvestId: 'T3_COMFREY',
  seedId: 'T3_FARM_COMFREY_SEED',
  name: 'Consuelda hojabrillante',
  tier: 3,
  growHours: 22,
  focusBonus: 0.8,
  focusCost: 1000,
  seedsPerHarvest: 0.6,
  defaultSeedPrice: 5780,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 consuelda hojabrillante</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 consuelda hojabrillante</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'La ciudad con rendimiento del producto es <strong>Caerleon</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+80%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T3_FARM_COMFREY_SEED', label: 'Semilla de Consuelda hojabrillante', noPremium: '60%', withPremium: '140%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T3_Consuelda_Hojabrillante' },
    { itemId: 'T3_COMFREY', label: 'Consuelda hojabrillante', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T3_Consuelda_Hojabrillante' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};