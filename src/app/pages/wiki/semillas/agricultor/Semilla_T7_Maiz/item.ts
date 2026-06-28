import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T7_Maiz',
  harvestId: 'T7_CORN',
  seedId: 'T7_FARM_CORN_SEED',
  name: 'Maíz',
  tier: 7,
  growHours: 22,
  focusBonus: 0.18,
  focusCost: 1000,
  seedsPerHarvest: 0.9111,
  defaultSeedPrice: 26010,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 maíz</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 maíz</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Bridgewatch</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+18%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T7_FARM_CORN_SEED', label: 'Semilla de Maíz', noPremium: '91.11%', withPremium: '109.11%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T7_Maiz' },
    { itemId: 'T7_CORN', label: 'Maíz', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T7_Maiz' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
