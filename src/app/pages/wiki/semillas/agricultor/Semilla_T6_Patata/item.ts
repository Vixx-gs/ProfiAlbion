import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T6_Patata',
  harvestId: 'T6_POTATO',
  seedId: 'T6_FARM_POTATO_SEED',
  name: 'Patata',
  tier: 6,
  growHours: 22,
  focusBonus: 0.27,
  focusCost: 1000,
  seedsPerHarvest: 0.8667,
  defaultSeedPrice: 17340,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 patatas</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 patatas</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Martlock</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+27%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T6_FARM_POTATO_SEED', label: 'Semilla de Patata', noPremium: '86.67%', withPremium: '113.67%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T6_Patata' },
    { itemId: 'T6_POTATO', label: 'Patata', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T6_Patata' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
