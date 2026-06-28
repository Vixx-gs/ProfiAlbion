import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T3_Trigo',
  harvestId: 'T3_WHEAT',
  seedId: 'T3_FARM_WHEAT_SEED',
  name: 'Trigo',
  tier: 3,
  growHours: 22,
  focusBonus: 0.8,
  focusCost: 1000,
  seedsPerHarvest: 0.6,
  defaultSeedPrice: 5780,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 trigo</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 trigo</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Martlock</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+80%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T3_FARM_WHEAT_SEED', label: 'Semilla de Trigo', noPremium: '60%', withPremium: '140%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T3_Trigo' },
    { itemId: 'T3_WHEAT', label: 'Trigo', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T3_Trigo' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};