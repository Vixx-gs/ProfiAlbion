import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T8_Milenrama_Demoniaca',
  harvestId: 'T8_YARROW',
  seedId: 'T8_FARM_YARROW_SEED',
  name: 'Milenrama demoníaca',
  tier: 8,
  growHours: 22,
  focusBonus: 0.13,
  focusCost: 1000,
  seedsPerHarvest: 0.9333,
  defaultSeedPrice: 34680,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 milenrama demoníaca</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 milenrama demoníaca</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'La ciudad con rendimiento del producto es <strong>Fort Sterling</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+13%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T8_FARM_YARROW_SEED', label: 'Semilla de Milenrama demoníaca', noPremium: '93.33%', withPremium: '106.33%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T8_Milenrama_Demoniaca' },
    { itemId: 'T8_YARROW', label: 'Milenrama demoníaca', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T8_Milenrama_Demoniaca' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
