import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T7_Gordolobo_Igneo',
  harvestId: 'T7_MULLEIN',
  seedId: 'T7_FARM_MULLEIN_SEED',
  name: 'Gordolobo ígneo',
  tier: 7,
  growHours: 22,
  focusBonus: 0.18,
  focusCost: 1000,
  seedsPerHarvest: 0.9111,
  defaultSeedPrice: 26010,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 gordolobo ígneo</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 gordolobo ígneo</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Thetford</strong> y <strong>Caerleon</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+18%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T7_FARM_MULLEIN_SEED', label: 'Semilla de Gordolobo ígneo', noPremium: '91.11%', withPremium: '109.11%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T7_Gordolobo_Igneo' },
    { itemId: 'T7_MULLEIN', label: 'Gordolobo ígneo', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T7_Gordolobo_Igneo' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
