import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T1_Zanahoria',
  harvestId: 'T1_CARROT',
  seedId: 'T1_FARM_CARROT_SEED',
  name: 'Zanahoria',
  tier: 1,
  growHours: 22,
  focusBonus: 2.0,
  focusCost: 1000,
  seedsPerHarvest: 0,
  defaultSeedPrice: 2312,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 zanahorias</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 zanahorias</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'Las ciudades con rendimiento del producto son <strong>Lymhurst</strong> y <strong>Brecilien</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+200%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T1_FARM_CARROT_SEED', label: 'Semilla de Zanahoria', noPremium: '0%', withPremium: '200%', percentage: '100%', link: '/wiki/semillas/agricultor/Semilla_T1_Zanahoria' },
    { itemId: 'T1_CARROT', label: 'Zanahoria', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/agricultor/T1_Zanahoria' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};

