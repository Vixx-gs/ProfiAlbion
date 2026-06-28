import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T5_Cardo_Dragon',
  harvestId: 'T5_TEASEL',
  seedId: 'T5_FARM_TEASEL_SEED',
  name: 'Cardo de dragón',
  tier: 5,
  growHours: 22,
  focusBonus: 0.4,
  focusCost: 1000,
  seedsPerHarvest: 0.8,
  defaultSeedPrice: 11560,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 cardo de dragón</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 cardo de dragón</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Bridgewatch</strong> y <strong>Caerleon</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+40%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T5_FARM_TEASEL_SEED', label: 'Semilla de Cardo de dragón', noPremium: '80%', withPremium: '120%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T5_Cardo_Dragon' },
    { itemId: 'T5_TEASEL', label: 'Cardo de dragón', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T5_Cardo_Dragon' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};