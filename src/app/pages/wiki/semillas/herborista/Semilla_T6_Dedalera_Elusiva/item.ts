import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T6_Dedalera_Elusiva',
  harvestId: 'T6_FOXGLOVE',
  seedId: 'T6_FARM_FOXGLOVE_SEED',
  name: 'Dedalera elusiva',
  tier: 6,
  growHours: 22,
  focusBonus: 0.27,
  focusCost: 1000,
  seedsPerHarvest: 0.8667,
  defaultSeedPrice: 17340,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 dedalera elusiva</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 dedalera elusiva</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'La ciudad con rendimiento del producto es <strong>Martlock</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+27%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T6_FARM_FOXGLOVE_SEED', label: 'Semilla de Dedalera elusiva', noPremium: '86.67%', withPremium: '113.67%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T6_Dedalera_Elusiva' },
    { itemId: 'T6_FOXGLOVE', label: 'Dedalera elusiva', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T6_Dedalera_Elusiva' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
