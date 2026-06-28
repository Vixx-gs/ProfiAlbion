import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T2_Frijoles',
  harvestId: 'T2_BEAN',
  seedId: 'T2_FARM_BEAN_SEED',
  name: 'Frijoles',
  tier: 2,
  growHours: 22,
  focusBonus: 1.33,
  focusCost: 1000,
  seedsPerHarvest: 0.3333,
  defaultSeedPrice: 3468,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 frijoles</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 frijoles</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Bridgewatch</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+133%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T2_FARM_BEAN_SEED', label: 'Semilla de Frijoles', noPremium: '33.33%', withPremium: '166.33%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T2_Frijoles' },
    { itemId: 'T2_BEAN', label: 'Frijoles', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T2_Frijoles' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
