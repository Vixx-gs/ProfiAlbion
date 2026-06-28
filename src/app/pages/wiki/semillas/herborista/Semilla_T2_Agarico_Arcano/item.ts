import { ItemData } from '../../../wiki-types';

export const data: ItemData = {
  folder: 'Semilla_T2_Agarico_Arcano',
  harvestId: 'T2_AGARIC',
  seedId: 'T2_FARM_AGARIC_SEED',
  name: 'Agárico arcano',
  tier: 2,
  growHours: 22,
  focusBonus: 1.33,
  focusCost: 1000,
  seedsPerHarvest: 0.3333,
  defaultSeedPrice: 3468,
  moreInfo: [
    'Sin ningún bono se genera <strong>3-6 agárico arcano</strong>',
    'Con los bonos de ciudad y premium se genera entre <strong>6-14 agárico arcano</strong>',
    'El bono de ciudad es de <strong>+10%</strong> de rendimiento del producto',
    'La ciudad con rendimiento del producto es <strong>Thetford</strong>',
    'Con el premium activado tiene un <strong>+100%</strong> de rendimiento del producto',
    'Regar (utilizar el foco) hace que el rendimiento de semillas sea de <strong>+133%</strong>',
    'Al cosechar se consigue <strong>100</strong> de fama',
  ],
  drops: [
    { itemId: 'T2_FARM_AGARIC_SEED', label: 'Semilla de Agárico arcano', noPremium: '33.33%', withPremium: '166.33%', percentage: '100%', link: '/wiki/semillas/herborista/Semilla_T2_Agarico_Arcano' },
    { itemId: 'T2_AGARIC', label: 'Agárico arcano', noPremium: '3-6', withPremium: '6-12', percentage: '100%', link: '/wiki/cultivos/herborista/T2_Agarico_Arcano' },
    { itemId: 'T1_WORM', label: 'Gusano', quantity: '1', percentage: '10%' },
  ],
};
