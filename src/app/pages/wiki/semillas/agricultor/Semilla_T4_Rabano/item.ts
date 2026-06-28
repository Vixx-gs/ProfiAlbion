import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T4_Rabano',
  harvestId: 'T4_TURNIP',
  seedId: 'T4_FARM_TURNIP_SEED',
  name: 'Rábano',
  tier: 4,
  growHours: 22,
  focusBonus: 0.53,
  focusCost: 1000,
  seedsPerHarvest: 0.7333,
  defaultSeedPrice: 8670,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 rábanos</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 rábanos</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Fort Sterling</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+53%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T4_FARM_TURNIP_SEED', label: 'Semilla de Rábano', noPremium: '73.33%', withPremium: '126.33%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T4_Rabano' },
    { itemId: 'T4_TURNIP', label: 'Rábano', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T4_Rabano' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
