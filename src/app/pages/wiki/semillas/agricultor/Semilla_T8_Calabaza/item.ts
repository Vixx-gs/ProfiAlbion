import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T8_Calabaza',
  harvestId: 'T8_PUMPKIN',
  seedId: 'T8_FARM_PUMPKIN_SEED',
  name: 'Calabaza',
  tier: 8,
  growHours: 22,
  focusBonus: 0.13,
  focusCost: 1000,
  seedsPerHarvest: 0.9333,
  defaultSeedPrice: 34680,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 calabazas</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 calabazas</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Lymhurst</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+13%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T8_FARM_PUMPKIN_SEED', label: 'Semilla de Calabaza', noPremium: '93.33%', withPremium: '106.33%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T8_Calabaza' },
    { itemId: 'T8_PUMPKIN', label: 'Calabaza', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T8_Calabaza' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
