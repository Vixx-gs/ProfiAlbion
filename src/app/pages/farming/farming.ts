import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbionDataService } from '../../core/albion-data.service';
import { MarketFlip } from '../../core/market-flips.service';
import { MarketHistory } from '../flips/market-history/market-history';
import { harvestIdToFolder } from '../wiki/wiki-data';
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
  focusBonus: number;
}

const CROPS: CropDef[] = [
  { id: 'CARROT', name: 'Zanahoria', iconId: 'T1_FARM_CARROT_SEED', harvestId: 'T1_CARROT', defaultSeedPrice: 2312, seedsPerHarvest: 0, yieldPerHarvest: 4.5, growHours: 22, focusCost: 0, focusBonus: 2.0 },
  { id: 'BEAN', name: 'Frijoles', iconId: 'T2_FARM_BEAN_SEED', harvestId: 'T2_BEAN', defaultSeedPrice: 3468, seedsPerHarvest: 0.3333, yieldPerHarvest: 4.5, growHours: 10, focusCost: 0, focusBonus: 1.33 },
  { id: 'WHEAT', name: 'Trigo', iconId: 'T3_FARM_WHEAT_SEED', harvestId: 'T3_WHEAT', defaultSeedPrice: 5780, seedsPerHarvest: 0.6, yieldPerHarvest: 4.5, growHours: 14, focusCost: 0, focusBonus: 0.8 },
  { id: 'TURNIP', name: 'Rábano', iconId: 'T4_FARM_TURNIP_SEED', harvestId: 'T4_TURNIP', defaultSeedPrice: 8670, seedsPerHarvest: 0.7333, yieldPerHarvest: 4.5, growHours: 12, focusCost: 0, focusBonus: 0.53 },
  { id: 'CABBAGE', name: 'Col', iconId: 'T5_FARM_CABBAGE_SEED', harvestId: 'T5_CABBAGE', defaultSeedPrice: 11560, seedsPerHarvest: 0.8, yieldPerHarvest: 4.5, growHours: 16, focusCost: 0, focusBonus: 0.4 },
  { id: 'POTATO', name: 'Patata', iconId: 'T6_FARM_POTATO_SEED', harvestId: 'T6_POTATO', defaultSeedPrice: 17340, seedsPerHarvest: 0.8667, yieldPerHarvest: 4.5, growHours: 18, focusCost: 0, focusBonus: 0.27 },
  { id: 'CORN', name: 'Maíz', iconId: 'T7_FARM_CORN_SEED', harvestId: 'T7_CORN', defaultSeedPrice: 26010, seedsPerHarvest: 0.9111, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.18 },
  { id: 'PUMPKIN', name: 'Calabaza', iconId: 'T8_FARM_PUMPKIN_SEED', harvestId: 'T8_PUMPKIN', defaultSeedPrice: 34680, seedsPerHarvest: 0.9333, yieldPerHarvest: 4.5, growHours: 22, focusCost: 0, focusBonus: 0.13 },
];

const HERBS: CropDef[] = [
  { id: 'AGARIC', name: 'Agárico arcano', iconId: 'T2_FARM_AGARIC_SEED', harvestId: 'T2_AGARIC', defaultSeedPrice: 3468, seedsPerHarvest: 0.3333, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 1.33 },
  { id: 'COMFREY', name: 'Consuelda hojabrillante', iconId: 'T3_FARM_COMFREY_SEED', harvestId: 'T3_COMFREY', defaultSeedPrice: 5780, seedsPerHarvest: 0.6, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.8 },
  { id: 'BURDOCK', name: 'Bardana almenada', iconId: 'T4_FARM_BURDOCK_SEED', harvestId: 'T4_BURDOCK', defaultSeedPrice: 8670, seedsPerHarvest: 0.7333, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.53 },
  { id: 'TEASEL', name: 'Cardo de dragón', iconId: 'T5_FARM_TEASEL_SEED', harvestId: 'T5_TEASEL', defaultSeedPrice: 11560, seedsPerHarvest: 0.8, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.4 },
  { id: 'FOXGLOVE', name: 'Dedalera elusiva', iconId: 'T6_FARM_FOXGLOVE_SEED', harvestId: 'T6_FOXGLOVE', defaultSeedPrice: 17340, seedsPerHarvest: 0.8667, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.27 },
  { id: 'MULLEIN', name: 'Gordolobo ígneo', iconId: 'T7_FARM_MULLEIN_SEED', harvestId: 'T7_MULLEIN', defaultSeedPrice: 26010, seedsPerHarvest: 0.9111, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.18 },
  { id: 'YARROW', name: 'Milenrama demoníaca', iconId: 'T8_FARM_YARROW_SEED', harvestId: 'T8_YARROW', defaultSeedPrice: 34680, seedsPerHarvest: 0.9333, yieldPerHarvest: 4.5, growHours: 20, focusCost: 0, focusBonus: 0.13 },
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
  imports: [DecimalPipe, FormsModule, MarketHistory],
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
  readonly harvestPrices = signal<Record<string, number>>({});
  readonly harvestDates = signal<Record<string, string>>({});

  readonly plantCity = signal(PLANT_CITIES[0]);
  readonly marketCity = signal(MARKET_CITIES[0]);

  readonly currentItems = computed(() => this.tab() === 'crops' ? this.crops : this.herbs);
  readonly currentSelected = computed(() => this.tab() === 'crops' ? this.selCrop() : this.selHerb());

  /** Categoría wiki (agricultor / herborista) según la pestaña activa. */
  readonly wikiCategory = computed(() => (this.tab() === 'crops' ? 'agricultor' : 'herborista'));

  /** Nombre de carpeta wiki (ej: T1_Zanahoria). */
  readonly wikiFolder = computed(() => harvestIdToFolder(this.currentSelected().harvestId));

  /** Ruta wiki de la semilla. */
  readonly wikiSeedRoute = computed(() => {
    const cat = this.wikiCategory();
    const f = this.wikiFolder();
    return `/wiki/semillas/${cat}/Semilla_${f}`;
  });

  /** Ruta wiki del cultivo cosechado. */
  readonly wikiHarvestRoute = computed(() => {
    const cat = this.wikiCategory();
    const f = this.wikiFolder();
    return `/wiki/cultivos/${cat}/${f}`;
  });

  private readonly fetchTrigger = new Subject<void>();
  private readonly priceSub: Subscription;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.priceSub = this.fetchTrigger.pipe(
      debounceTime(100),
      switchMap(() => {
        const items = this.currentItems();
        const city = this.marketCity();
        if (!items.length) return of(null);
        return this.api.getPrices(items.map(i => i.harvestId), [city], []).pipe(
          timeout(10000),
          catchError(() => of(null)),
        );
      }),
    ).subscribe((result) => {
      if (!result) return;
      const prices: Record<string, number> = {};
      const dates: Record<string, string> = {};
      for (const p of result) {
        if (p.sell_price_min) {
          const existing = prices[p.item_id];
          if (!existing || (p.sell_price_min_date && p.sell_price_min_date > (dates[p.item_id] ?? ''))) {
            prices[p.item_id] = p.sell_price_min;
          }
        }
        if (!dates[p.item_id] || p.sell_price_min_date > dates[p.item_id]) {
          dates[p.item_id] = p.sell_price_min_date;
        }
      }
      this.harvestPrices.set(prices);
      this.harvestDates.set(dates);
      const sel = this.currentSelected();
      if (sel && prices[sel.harvestId]) this.yieldPrice.set(prices[sel.harvestId]);
    });

    destroyRef.onDestroy(() => {
      this.priceSub.unsubscribe();
    });

    effect(() => {
      this.currentItems();
      this.marketCity();
      this.fetchTrigger.next();
    });

    effect(() => {
      const sel = this.currentSelected();
      const prices = this.harvestPrices();
      if (sel && prices[sel.harvestId]) {
        this.yieldPrice.set(prices[sel.harvestId]);
      }
    });
  }

  readonly result = computed(() => {
    const item = this.currentSelected();
    const n = this.plots();
    const focus = this.focus();
    const premium = this.premium();
    const seedPrice = this.seedPrice();
    const yieldPrice = this.yieldPrice();

    const premiumMult = premium ? 2 : 1;
    const taxRate = premium ? 0.04 : 0.08;
    const taxMultiplier = 1 - taxRate;
    const biomeBonus = (BIOME_BONUS[this.plantCity()] ?? []).includes(item.id) ? 1.1 : 1;

    const seedsNeeded = n;
    const seedsPerPlot = item.seedsPerHarvest + (focus ? item.focusBonus : 0);
    const seedsBackWorst = Math.floor(seedsPerPlot) * n;
    const seedsBack = Math.ceil(seedsPerPlot) * n;
    const grossYield = Math.floor(item.yieldPerHarvest * n * premiumMult * biomeBonus);

    const yieldRangeMin = Math.floor(3 * premiumMult * biomeBonus);
    const yieldRangeMax = Math.ceil(6 * premiumMult * biomeBonus);

    const worstGrossYield = yieldRangeMin * n;
    const bestGrossYield = yieldRangeMax * n;
    const worstIncomeYield = Math.round(worstGrossYield * yieldPrice * taxMultiplier);
    const bestIncomeYield = Math.round(bestGrossYield * yieldPrice * taxMultiplier);

    const seedCost = Math.round(seedsNeeded * seedPrice);
    const incomeSeeds = Math.round(seedsBack * seedPrice * 0.6);
    const incomeYield = Math.round(grossYield * yieldPrice * taxMultiplier);
    const totalIncome = incomeSeeds + incomeYield;
    const totalCost = seedCost;
    const profit = totalIncome - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    const worstTotalIncome = worstIncomeYield;
    const worstProfit = worstTotalIncome - totalCost;
    const worstRoi = totalCost > 0 ? (worstProfit / totalCost) * 100 : 0;

    const bestTotalIncome = bestIncomeYield;
    const bestProfit = bestTotalIncome - totalCost;
    const bestRoi = totalCost > 0 ? (bestProfit / totalCost) * 100 : 0;

    const hours = item.growHours;
    const profitPerPlot = profit / n;
    const profitPerHour = hours > 0 ? profitPerPlot / hours : 0;
    const totalFocus = focus ? this.focusCostInput() * n : 0;

    return {
      seedsNeeded,
      seedsBackWorst,
      seedsBack,
      grossYield,
      worstGrossYield,
      bestGrossYield,
      yieldRangeMin,
      yieldRangeMax,
      seedCost,
      incomeSeeds,
      incomeYield,
      totalIncome,
      totalCost,
      profit,
      roi,
      worstTotalIncome,
      worstProfit,
      worstRoi,
      bestTotalIncome,
      bestProfit,
      bestRoi,
      profitPerPlot,
      profitPerHour,
      totalFocus,
      biomeBonus,
    };
  });

  // ===== Modal de historial de mercado (doble click en semilla) =====
  readonly historyCrop = signal<MarketFlip | null>(null);
  readonly historyIconId = signal('');

  openHistory(item: CropDef): void {
    this.historyIconId.set(item.iconId);
    this.historyCrop.set({
      itemId: item.iconId,
      name: item.name,
      tier: 0,
      quality: 1,
      buyCity: this.marketCity(),
      buyPrice: 0,
      sellCity: this.marketCity(),
      sellPrice: 0,
      sellBuyMax: 0,
      profit: 0,
      marginPct: 0,
      updatedAt: new Date().toISOString(),
      volume24h: 0,
    });
  }

  closeHistory(): void {
    this.historyCrop.set(null);
    this.historyIconId.set('');
  }

  ago(iso: string): string {
    if (!iso) return '';
    const min = Math.max(0, Math.round((Date.now() - new Date(iso + 'Z').getTime()) / 60000));
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  }

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
