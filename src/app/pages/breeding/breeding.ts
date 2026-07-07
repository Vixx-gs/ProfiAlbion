import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbionDataService } from '../../core/albion-data.service';
import { MarketFlip } from '../../core/market-flips.service';
import { MarketHistory } from '../flips/market-history/market-history';
import { Subject, Subscription, catchError, debounceTime, of, switchMap, timeout } from 'rxjs';

type AnimalMode = 'meat' | 'product';

interface AnimalDef {
  id: string;
  name: string;
  iconId: string;
  adultId: string;
  meatId: string;
  hasProduct: boolean;
  productId?: string;
  feedCropId: string;
  feedQty: number;
  npcBabyPrice: number;
  growHours: number;
  focusCost: number;
  focusBonus: number;
  bonusCity: string;
  offspringBase: number;
  offspringFocusBonus: number;
}

const BASE_MEAT_PER_ANIMAL = 18;
const MEAT_BONUS_MULTIPLIER = 1.15;
const BASE_PRODUCT_YIELD = 9;
const PREMIUM_PRODUCT_YIELD = 18;
const BASE_CYCLE_HOURS = 22;
const PREMIUM_CYCLE_HOURS = 11;
const RRR_ROYAL_BONUS = 18;
const RRR_BONUS_CITY_BONUS = 33;
const RRR_FOCUS_BONUS = 59;

const ANIMALS: AnimalDef[] = [
  { id: 'CHICKEN', name: 'Gallina', iconId: 'T3_FARM_CHICKEN_BABY', adultId: 'T3_FARM_CHICKEN_GROWN', meatId: 'T3_MEAT', hasProduct: true, productId: 'T3_EGG', feedCropId: 'T3_WHEAT', feedQty: 9, npcBabyPrice: 1000, growHours: 22, focusCost: 0, focusBonus: 0, bonusCity: 'Fort Sterling', offspringBase: 0.60, offspringFocusBonus: 0.80 },
  { id: 'GOAT', name: 'Cabra', iconId: 'T4_FARM_GOAT_BABY', adultId: 'T4_FARM_GOAT_GROWN', meatId: 'T4_MEAT', hasProduct: true, productId: 'T4_MILK', feedCropId: 'T4_TURNIP', feedQty: 9, npcBabyPrice: 3000, growHours: 20, focusCost: 0, focusBonus: 0, bonusCity: 'Bridgewatch', offspringBase: 0.73, offspringFocusBonus: 0.54 },
  { id: 'GOOSE', name: 'Ganso', iconId: 'T5_FARM_GOOSE_BABY', adultId: 'T5_FARM_GOOSE_GROWN', meatId: 'T5_MEAT', hasProduct: true, productId: 'T5_EGG', feedCropId: 'T5_CABBAGE', feedQty: 9, npcBabyPrice: 7000, growHours: 20, focusCost: 0, focusBonus: 0, bonusCity: 'Lymhurst', offspringBase: 0.80, offspringFocusBonus: 0.40 },
  { id: 'SHEEP', name: 'Oveja', iconId: 'T6_FARM_SHEEP_BABY', adultId: 'T6_FARM_SHEEP_GROWN', meatId: 'T6_MEAT', hasProduct: true, productId: 'T6_MILK', feedCropId: 'T6_POTATO', feedQty: 9, npcBabyPrice: 15000, growHours: 22, focusCost: 0, focusBonus: 0, bonusCity: 'Fort Sterling', offspringBase: 0.87, offspringFocusBonus: 0.26 },
  { id: 'PIG', name: 'Cerdo', iconId: 'T7_FARM_PIG_BABY', adultId: 'T7_FARM_PIG_GROWN', meatId: 'T7_MEAT', hasProduct: false, feedCropId: 'T7_CORN', feedQty: 9, npcBabyPrice: 30000, growHours: 24, focusCost: 0, focusBonus: 0, bonusCity: 'Thetford', offspringBase: 0.91, offspringFocusBonus: 0.18 },
  { id: 'COW', name: 'Vaca', iconId: 'T8_FARM_COW_BABY', adultId: 'T8_FARM_COW_GROWN', meatId: 'T8_MEAT', hasProduct: true, productId: 'T8_MILK', feedCropId: 'T8_PUMPKIN', feedQty: 9, npcBabyPrice: 50000, growHours: 26, focusCost: 0, focusBonus: 0, bonusCity: 'Martlock', offspringBase: 0.93, offspringFocusBonus: 0.14 },
];

const PLANT_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Caerleon', 'Brecilien',
];

const MARKET_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling',
  'Caerleon', 'Brecilien',
];

const ITEM_NAMES: Record<string, string> = {
  T3_WHEAT: 'Trigo',
  T4_TURNIP: 'Nabo',
  T5_CABBAGE: 'Repollo',
  T6_POTATO: 'Patata',
  T7_CORN: 'Maíz',
  T8_PUMPKIN: 'Calabaza',
  T3_EGG: 'Huevos',
  T4_MILK: 'Leche',
  T5_EGG: 'Huevos',
  T6_MILK: 'Leche',
  T8_MILK: 'Leche',
};

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

@Component({
  selector: 'app-breeding',
  imports: [DecimalPipe, PercentPipe, FormsModule, MarketHistory],
  templateUrl: './breeding.html',
  styleUrl: './breeding.scss',
})
export class Breeding {
  private readonly api = inject(AlbionDataService);

  readonly animals = ANIMALS;
  readonly plantCities = PLANT_CITIES;
  readonly marketCities = MARKET_CITIES;


  readonly selAnimal = signal<AnimalDef>(ANIMALS[0]);
  readonly mode = signal<AnimalMode>('meat');
  readonly pens = signal(9);

  readonly npcBabyPrice = signal(ANIMALS[0].npcBabyPrice);
  readonly meatPrice = signal(0);
  readonly productPrice = signal(0);
  readonly feedPrice = signal(0);
  readonly harvestPrices = signal<Record<string, number>>({});
  readonly harvestDates = signal<Record<string, string>>({});

  readonly plantCity = signal(PLANT_CITIES[0]);
  readonly marketCity = signal(MARKET_CITIES[0]);

  readonly currentSelected = computed(() => this.selAnimal());

  readonly premium = signal(false);
  readonly focusMatadero = signal(false);
  readonly focusCrianza = signal(false);

  readonly offspringYield = computed(() => {
    const a = this.selAnimal();
    return a.offspringBase + (this.focusCrianza() ? a.offspringFocusBonus : 0);
  });

  readonly meatPerAnimal = computed(() => {
    const a = this.selAnimal();
    const city = this.plantCity();
    return city === a.bonusCity
      ? BASE_MEAT_PER_ANIMAL * MEAT_BONUS_MULTIPLIER
      : BASE_MEAT_PER_ANIMAL;
  });

  readonly productYield = computed(() =>
    this.premium() ? PREMIUM_PRODUCT_YIELD : BASE_PRODUCT_YIELD,
  );

  readonly productCycleHours = computed(() =>
    this.premium() ? PREMIUM_CYCLE_HOURS : BASE_CYCLE_HOURS,
  );

  readonly rrr = computed(() => {
    const a = this.selAnimal();
    const city = this.plantCity();
    const hasFocus = this.focusMatadero();
    const isBonusCity = city === a.bonusCity;
    const bonus = isBonusCity ? RRR_BONUS_CITY_BONUS : RRR_ROYAL_BONUS;
    const totalBonus = bonus + (hasFocus ? RRR_FOCUS_BONUS : 0);
    return 1 - 1 / (1 + totalBonus / 100);
  });

  /** Conjunto de todos los IDs a fetchear para el animal actual y alimento. */
  private watchIds = computed(() => {
    const a = this.selAnimal();
    const ids = [a.meatId, a.feedCropId];
    if (a.hasProduct && a.productId) ids.push(a.productId);
    return ids;
  });

  private readonly fetchTrigger = new Subject<void>();
  private readonly priceSub: Subscription;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.priceSub = this.fetchTrigger.pipe(
      debounceTime(100),
      switchMap(() => {
        const ids = this.watchIds();
        const pCity = this.plantCity();
        const mCity = this.marketCity();
        if (!ids.length) return of(null);
        return this.api.getPrices(ids, [pCity, mCity], []).pipe(
          timeout(10000),
          catchError(() => of(null)),
        );
      }),
    ).subscribe((result) => {
      if (!result) return;
      const pCity = this.plantCity();
      const mCity = this.marketCity();
      const a = this.selAnimal();

      // HarvestPrices: keep best price per item (for date display on all animals)
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

      // Prices per city: feed from plantCity, meat/product from marketCity
      for (const p of result) {
        if (!p.sell_price_min) continue;
        if (p.item_id === a.feedCropId && p.city === pCity) {
          this.feedPrice.set(p.sell_price_min);
        }
        if (p.item_id === a.meatId && p.city === mCity) {
          this.meatPrice.set(p.sell_price_min);
        }
        if (a.productId && p.item_id === a.productId && p.city === mCity) {
          this.productPrice.set(p.sell_price_min);
        }
      }
    });

    destroyRef.onDestroy(() => {
      this.priceSub.unsubscribe();
    });

    effect(() => {
      this.selAnimal();
      this.plantCity();
      this.marketCity();
      this.fetchTrigger.next();
    });
  }

  readonly result = computed(() => {
    const a = this.selAnimal();
    const n = this.pens();
    const mode = this.mode();
    const npcBabyPrice = this.npcBabyPrice();
    const meatPrice = this.meatPrice();
    const productPrice = this.productPrice();
    const feedPrice = this.feedPrice();
    const mpa = this.meatPerAnimal();
    const rrr = this.rrr();
    const offspringYield = this.offspringYield();
    const pYield = this.productYield();
    const prodHrs = this.productCycleHours();

    const feedCost = a.feedQty * feedPrice;

    // Modo carne: RRR y crías reducen el coste efectivo
    const effectiveBabyCost = npcBabyPrice * (1 - rrr - offspringYield);
    const meatCost = (effectiveBabyCost + feedCost) * n;
    const meatIncome = meatPrice * mpa * n;
    const meatProfit = meatIncome - meatCost;
    const meatRoi = meatCost > 0 ? (meatProfit / meatCost) * 100 : 0;

    // Modo producto: el adulto produce X unidades por ciclo (según premium)
    const productCost = feedCost * n;
    const productIncome = productPrice * pYield * n;
    const productProfit = productIncome - productCost;
    const productRoi = productCost > 0 ? (productProfit / productCost) * 100 : 0;

    // Horas relevantes según modo
    const hours = mode === 'meat' ? a.growHours : prodHrs;

    const profitPerPen = mode === 'meat' ? meatProfit / n : productProfit / n;
    const profitPerHour = hours > 0 ? profitPerPen / hours : 0;

    return {
      mode,
      babyCost: npcBabyPrice,
      feedCost,
      rrr,
      effectiveBabyCost,
      meatCost,
      meatIncome,
      meatProfit,
      meatRoi,
      productCost,
      productIncome,
      productProfit,
      productRoi,
      meatPerAnimal: mpa,
      productYield: pYield,
      cycleHours: hours,
      totalCost: mode === 'meat' ? meatCost : productCost,
      totalIncome: mode === 'meat' ? meatIncome : productIncome,
      profit: mode === 'meat' ? meatProfit : productProfit,
      roi: mode === 'meat' ? meatRoi : productRoi,
      profitPerPen,
      profitPerHour,
    };
  });

  readonly historyAnimal = signal<MarketFlip | null>(null);
  readonly historyIconId = signal('');

  openHistory(item: AnimalDef): void {
    this.historyIconId.set(item.iconId);
    this.historyAnimal.set({
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
    this.historyAnimal.set(null);
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

  selectItem(item: AnimalDef): void {
    this.npcBabyPrice.set(item.npcBabyPrice);
    this.selAnimal.set(item);
  }

  setMode(m: AnimalMode): void {
    this.mode.set(m);
  }

  setPlantCity(city: string): void {
    this.plantCity.set(city);
  }

  setMarketCity(city: string): void {
    this.marketCity.set(city);
  }

  feedCropName(id: string): string {
    return ITEM_NAMES[id] ?? id;
  }

  tierLabel(itemId: string): string {
    const tier = itemId.match(/^(T\d)/)?.[1] ?? '';
    return tier ? `T${tier.slice(1)}` : '';
  }
}
