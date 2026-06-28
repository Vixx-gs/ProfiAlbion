import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T5_Col',
  harvestId: 'T5_CABBAGE',
  seedId: 'T5_FARM_CABBAGE_SEED',
  name: 'Col',
  tier: 5,
  growHours: 22,
  focusBonus: 0.4,
  focusCost: 1000,
  seedsPerHarvest: 0.8,
  defaultSeedPrice: 11560,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 col</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 col</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Thetford</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+40%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T5_FARM_CABBAGE_SEED', label: 'Semilla de Col', noPremium: '80%', withPremium: '120%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T5_Col' },
    { itemId: 'T5_CABBAGE', label: 'Col', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T5_Col' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};