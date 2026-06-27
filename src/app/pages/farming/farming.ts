import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbionDataService } from '../../core/albion-data.service';
import { Subject, Subscription, catchError, debounceTime, of, switchMap, timeout } from 'rxjs';

interface CropDef {
  id: string;
  name: string;
  iconId: string;
  harvestId: string;
  defaultSeedPrice: number;
  seedsPerHarvest: number;
  yieldPerHarvest: number;
  growHours: number;
  focusCost: number;
}

const CROPS: CropDef[] = [
  { id: 'CARROT', name: 'Zanahoria', iconId: 'T1_FARM_CARROT_SEED', harvestId: 'T1_CARROT', defaultSeedPrice: 2312, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 22, focusCost: 0 },
  { id: 'BEAN', name: 'Judía', iconId: 'T2_FARM_BEAN_SEED', harvestId: 'T2_BEAN', defaultSeedPrice: 3468, seedsPerHarvest: 2, yieldPerHarvest: 4, growHours: 10, focusCost: 0 },
  { id: 'WHEAT', name: 'Trigo', iconId: 'T3_FARM_WHEAT_SEED', harvestId: 'T3_WHEAT', defaultSeedPrice: 5780, seedsPerHarvest: 4, yieldPerHarvest: 6, growHours: 14, focusCost: 0 },
  { id: 'TURNIP', name: 'Nabo', iconId: 'T4_FARM_TURNIP_SEED', harvestId: 'T4_TURNIP', defaultSeedPrice: 8670, seedsPerHarvest: 3, yieldPerHarvest: 5, growHours: 12, focusCost: 0 },
  { id: 'CABBAGE', name: 'Col', iconId: 'T5_FARM_CABBAGE_SEED', harvestId: 'T5_CABBAGE', defaultSeedPrice: 11560, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 16, focusCost: 0 },
  { id: 'POTATO', name: 'Patata', iconId: 'T6_FARM_POTATO_SEED', harvestId: 'T6_POTATO', defaultSeedPrice: 17340, seedsPerHarvest: 2, yieldPerHarvest: 4, growHours: 18, focusCost: 0 },
  { id: 'CORN', name: 'Maíz', iconId: 'T7_FARM_CORN_SEED', harvestId: 'T7_CORN', defaultSeedPrice: 26010, seedsPerHarvest: 3, yieldPerHarvest: 5, growHours: 20, focusCost: 0 },
  { id: 'PUMPKIN', name: 'Calabaza', iconId: 'T8_FARM_PUMPKIN_SEED', harvestId: 'T8_PUMPKIN', defaultSeedPrice: 34680, seedsPerHarvest: 2, yieldPerHarvest: 4, growHours: 22, focusCost: 0 },
];

const HERBS: CropDef[] = [
  { id: 'AGARIC', name: 'Agaric arcano', iconId: 'T2_FARM_AGARIC_SEED', harvestId: 'T2_AGARIC', defaultSeedPrice: 3468, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'COMFREY', name: 'Consuelda bril.', iconId: 'T3_FARM_COMFREY_SEED', harvestId: 'T3_COMFREY', defaultSeedPrice: 5780, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'BURDOCK', name: 'Bardana crespa', iconId: 'T4_FARM_BURDOCK_SEED', harvestId: 'T4_BURDOCK', defaultSeedPrice: 8670, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'TEASEL', name: 'Cardo dragón', iconId: 'T5_FARM_TEASEL_SEED', harvestId: 'T5_TEASEL', defaultSeedPrice: 11560, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'FOXGLOVE', name: 'Digital evasiva', iconId: 'T6_FARM_FOXGLOVE_SEED', harvestId: 'T6_FOXGLOVE', defaultSeedPrice: 17340, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'MULLEIN', name: 'Gordolobo ígneo', iconId: 'T7_FARM_MULLEIN_SEED', harvestId: 'T7_MULLEIN', defaultSeedPrice: 26010, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
  { id: 'YARROW', name: 'Milenrama ghoul', iconId: 'T8_FARM_YARROW_SEED', harvestId: 'T8_YARROW', defaultSeedPrice: 34680, seedsPerHarvest: 2, yieldPerHarvest: 3, growHours: 20, focusCost: 0 },
];

const PLANT_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Caerleon', 'Brecilien',
];

const MARKET_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling',
  'Caerleon', 'Brecilien',
];

const CITY_COLORS: Record<string, string> = {
  'Fort Sterling': '#d8dde8',
  Lymhurst: '#7ed957',
  Bridgewatch: '#e8a33d',
  Martlock: '#4f8cff',
  Thetford: '#b06fe8',
  Caerleon: '#e8434f',
  Brecilien: '#3fc7b4',
  'Black Market': '#2b2f3a',
};

const BIOME_BONUS: Record<string, string[]> = {
  Bridgewatch: ['BEAN', 'CORN', 'TEASEL'],
  Martlock: ['WHEAT', 'POTATO', 'FOXGLOVE'],
  Thetford: ['CABBAGE', 'AGARIC', 'MULLEIN'],
  Lymhurst: ['CARROT', 'PUMPKIN', 'BURDOCK'],
  'Fort Sterling': ['TURNIP', 'YARROW'],
  Caerleon: ['COMFREY', 'TEASEL', 'MULLEIN'],
  Brecilien: ['CARROT', 'BEAN', 'WHEAT', 'TURNIP', 'CABBAGE', 'POTATO', 'CORN', 'PUMPKIN'],
};

type FarmingTab = 'crops' | 'herbs';

@Component({
  selector: 'app-farming',
  imports: [DecimalPipe, FormsModule],
  templateUrl: './farming.html',
  styleUrl: './farming.scss',
})
export class Farming {
  private readonly api = inject(AlbionDataService);

  readonly crops = CROPS;
  readonly herbs = HERBS;
  readonly plantCities = PLANT_CITIES;
  readonly marketCities = MARKET_CITIES;

  readonly tab = signal<FarmingTab>('crops');

  readonly selCrop = signal<CropDef>(CROPS[0]);
  readonly selHerb = signal<CropDef>(HERBS[0]);
  readonly plots = signal(9);

  readonly focus = signal(true);
  readonly premium = signal(true);

  readonly seedPrice = signal(CROPS[0].defaultSeedPrice);
  readonly focusPrice = signal(30);
  readonly focusCostInput = signal(CROPS[0].focusCost);
  readonly yieldPrice = signal(0);

  readonly plantCity = signal(PLANT_CITIES[0]);
  readonly marketCity = signal(MARKET_CITIES[0]);

  readonly currentItems = computed(() => this.tab() === 'crops' ? this.crops : this.herbs);
  readonly currentSelected = computed(() => this.tab() === 'crops' ? this.selCrop() : this.selHerb());

  private readonly fetchTrigger = new Subject<void>();
  private readonly priceSub: Subscription;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.priceSub = this.fetchTrigger.pipe(
      debounceTime(100),
      switchMap(() => {
        const item = this.currentSelected();
        const city = this.marketCity();
        if (!item) return of(null);
        return this.api.getPrices([item.iconId, item.harvestId], [city], []).pipe(
          timeout(10000),
          catchError(() => of(null)),
        );
      }),
    ).subscribe((result) => {
      if (!result) return;
      const harvestEntry = result.find((p) => p.item_id === this.currentSelected()?.harvestId);
      if (harvestEntry?.sell_price_min) this.yieldPrice.set(harvestEntry.sell_price_min);
    });

    destroyRef.onDestroy(() => this.priceSub.unsubscribe());

    effect(() => {
      this.currentSelected();
      this.marketCity();
      this.fetchTrigger.next();
    });
  }

  readonly result = computed(() => {
    const item = this.currentSelected();
    const n = this.plots();
    const focus = this.focus();
    const premium = this.premium();
    const seedPrice = this.seedPrice();
    const yieldPrice = this.yieldPrice();

    const focusMult = focus ? 1.3 : 1;
    const premiumMult = premium ? 2 : 1;
    const biomeBonus = (BIOME_BONUS[this.plantCity()] ?? []).includes(item.id) ? 1.1 : 1;

    const seedsNeeded = n;
    const seedsBack = Math.floor(item.seedsPerHarvest * n * 0.7 * premiumMult * focusMult);
    const grossYield = Math.floor(item.yieldPerHarvest * n * premiumMult * biomeBonus);

    const seedCost = Math.round(seedsNeeded * seedPrice);
    const incomeSeeds = Math.round(seedsBack * seedPrice * 0.6);
    const incomeYield = Math.round(grossYield * yieldPrice);
    const totalIncome = incomeSeeds + incomeYield;
    const totalCost = seedCost;
    const profit = totalIncome - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    const hours = item.growHours;
    const profitPerPlot = profit / n;
    const profitPerHour = hours > 0 ? profitPerPlot / hours : 0;
    const totalFocus = focus ? this.focusCostInput() * n : 0;

    return {
      seedsNeeded,
      seedsBack,
      grossYield,
      seedCost,
      incomeSeeds,
      incomeYield,
      totalIncome,
      totalCost,
      profit,
      roi,
      profitPerPlot,
      profitPerHour,
      totalFocus,
      biomeBonus,
    };
  });

  cityColor(city: string): string {
    return CITY_COLORS[city] ?? 'var(--text-dim)';
  }

  selectTab(t: FarmingTab): void {
    this.tab.set(t);
  }

  selectItem(item: CropDef): void {
    this.seedPrice.set(item.defaultSeedPrice);
    this.focusCostInput.set(item.focusCost);
    if (this.tab() === 'crops') {
      this.selCrop.set(item);
    } else {
      this.selHerb.set(item);
    }
  }

  setPlantCity(city: string): void {
    this.plantCity.set(city);
  }

  setMarketCity(city: string): void {
    this.marketCity.set(city);
  }
}
