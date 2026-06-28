import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T4_Bardana_Almenada',
  harvestId: 'T4_BURDOCK',
  seedId: 'T4_FARM_BURDOCK_SEED',
  name: 'Bardana almenada',
  tier: 4,
  growHours: 22,
  focusBonus: 0.53,
  focusCost: 1000,
  seedsPerHarvest: 0.7333,
  defaultSeedPrice: 8670,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 bardana almenada</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 bardana almenada</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'La ciudad con rendimiento del producto es <strong>Lymhurst</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+53%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T4_FARM_BURDOCK_SEED', label: 'Semilla de Bardana almenada', noPremium: '73.33%', withPremium: '126.33%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T4_Bardana_Almenada' },
    { itemId: 'T4_BURDOCK', label: 'Bardana almenada', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T4_Bardana_Almenada' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
