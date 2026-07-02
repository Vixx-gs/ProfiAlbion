import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe, LowerCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlbionDataService } from '../../core/albion-data.service';
import { Subject, Subscription, catchError, debounceTime, of, switchMap, timeout } from 'rxjs';

interface AnimalDef {
  id: string;
  name: string;
  iconId: string;
  defaultBabyPrice: number;
  growHours: number;
  feedUnits: number;
  feedUnitPrice: number;
  products: string;
  productIconId: string;
  defaultProductPrice: number;
  productPerDay: number;
  offspringChance: number;
  offspringName: string;
  focusBonus: number;
  /** Ciudades que dan bonificación de bioma (+10% producción). */
  biomeCities: string[];
  meatIconId: string;
  defaultMeatPrice: number;
  meatYield: number;
  favoriteFoodHarvestId: string;
  favoriteFoodName: string;
}

const ANIMALS: AnimalDef[] = [
  { id: 'CHICKEN', name: 'Pollo', iconId: 'T3_FARM_CHICKEN_BABY', defaultBabyPrice: 5780, growHours: 44, feedUnits: 18, feedUnitPrice: 28, products: 'Huevos', productIconId: 'T8_EGG', defaultProductPrice: 800, productPerDay: 3, offspringChance: 15, offspringName: 'Pollito', focusBonus: 1.5, biomeCities: ['Fort Sterling'], meatIconId: 'T8_RAW_CHICKEN', defaultMeatPrice: 600, meatYield: 3, favoriteFoodHarvestId: 'T3_WHEAT', favoriteFoodName: 'Trigo' },
  { id: 'GOAT', name: 'Cabra', iconId: 'T4_FARM_GOAT_BABY', defaultBabyPrice: 8670, growHours: 44, feedUnits: 18, feedUnitPrice: 33, products: 'Leche', productIconId: 'T8_MILK', defaultProductPrice: 1200, productPerDay: 2, offspringChance: 10, offspringName: 'Cabrito', focusBonus: 1.3, biomeCities: ['Bridgewatch'], meatIconId: 'T8_RAW_GOAT', defaultMeatPrice: 900, meatYield: 4, favoriteFoodHarvestId: 'T4_TURNIP', favoriteFoodName: 'Rábanos' },
  { id: 'GOOSE', name: 'Ganso', iconId: 'T5_FARM_GOOSE_BABY', defaultBabyPrice: 11560, growHours: 44, feedUnits: 18, feedUnitPrice: 25, products: 'Huevos', productIconId: 'T8_EGG', defaultProductPrice: 900, productPerDay: 2, offspringChance: 12, offspringName: 'Ansarino', focusBonus: 1.5, biomeCities: ['Lymhurst'], meatIconId: 'T8_RAW_GOOSE', defaultMeatPrice: 700, meatYield: 3, favoriteFoodHarvestId: 'T5_CABBAGE', favoriteFoodName: 'Col' },
  { id: 'SHEEP', name: 'Oveja', iconId: 'T6_FARM_SHEEP_BABY', defaultBabyPrice: 17340, growHours: 44, feedUnits: 18, feedUnitPrice: 31, products: 'Leche', productIconId: 'T8_MILK', defaultProductPrice: 1100, productPerDay: 2, offspringChance: 10, offspringName: 'Cordero', focusBonus: 1.3, biomeCities: ['Fort Sterling'], meatIconId: 'T8_RAW_MUTTON', defaultMeatPrice: 800, meatYield: 5, favoriteFoodHarvestId: 'T6_POTATO', favoriteFoodName: 'Patatas' },
  { id: 'PIG', name: 'Cerdo', iconId: 'T7_FARM_PIG_BABY', defaultBabyPrice: 26010, growHours: 44, feedUnits: 18, feedUnitPrice: 42, products: 'Lechones', productIconId: 'T7_FARM_PIG_BABY', defaultProductPrice: 6800, productPerDay: 0.5, offspringChance: 25, offspringName: 'Lechón', focusBonus: 1.2, biomeCities: ['Thetford'], meatIconId: 'T8_RAW_PORK', defaultMeatPrice: 1000, meatYield: 7, favoriteFoodHarvestId: 'T7_CORN', favoriteFoodName: 'Maíz' },
  { id: 'COW', name: 'Vaca', iconId: 'T8_FARM_COW_BABY', defaultBabyPrice: 34680, growHours: 44, feedUnits: 18, feedUnitPrice: 44, products: 'Leche', productIconId: 'T8_MILK', defaultProductPrice: 1300, productPerDay: 3, offspringChance: 8, offspringName: 'Ternero', focusBonus: 1.2, biomeCities: ['Martlock'], meatIconId: 'T8_RAW_BEEF', defaultMeatPrice: 1100, meatYield: 9, favoriteFoodHarvestId: 'T8_PUMPKIN', favoriteFoodName: 'Calabaza' },
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

const PLANT_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Caerleon', 'Brecilien',
];

const MARKET_CITIES = [
  'Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling',
  'Caerleon', 'Brecilien',
];

@Component({
  selector: 'app-animals-domesticos',
  imports: [DecimalPipe, LowerCasePipe, FormsModule],
  templateUrl: './animals-domesticos.html',
  styleUrl: './animals-domesticos.scss',
})
export class AnimalsDomesticos {
  private readonly api = inject(AlbionDataService);

  readonly animals = ANIMALS;

  readonly plantCities = PLANT_CITIES;
  readonly marketCities = MARKET_CITIES;

  readonly selAnimal = signal<AnimalDef>(ANIMALS[0]);
  readonly heads = signal(9);

  readonly premium = signal(true);
  readonly focus = signal(true);

  readonly babyPrice = signal(ANIMALS[0].defaultBabyPrice);
  readonly feedUnitPrice = signal(ANIMALS[0].feedUnitPrice);
  readonly productPrice = signal(ANIMALS[0].defaultProductPrice);
  readonly focusCost = signal(0);
  readonly favoriteFood = signal(true);

  readonly plantCity = signal(PLANT_CITIES[0]);
  readonly marketCity = signal(MARKET_CITIES[0]);

  readonly currentFoodHarvestId = computed(() => {
    const a = this.selAnimal();
    return this.favoriteFood() ? a.favoriteFoodHarvestId : 'T1_CARROT';
  });

  readonly currentFoodName = computed(() => {
    const a = this.selAnimal();
    return this.favoriteFood() ? a.favoriteFoodName : 'Zanahorias';
  });

  private readonly fetchTrigger = new Subject<void>();
  private readonly priceSub: Subscription;

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.priceSub = this.fetchTrigger.pipe(
      debounceTime(100),
      switchMap(() => {
        const harvestId = this.currentFoodHarvestId();
        const city = this.marketCity();
        if (!harvestId || !city) return of(null);
        return this.api.getPrices([harvestId], [city], []).pipe(
          timeout(10000),
          catchError(() => of(null)),
        );
      }),
    ).subscribe((result) => {
      if (!result || result.length === 0) {
        this.feedUnitPrice.set(0);
        return;
      }
      const entry = result.find((p) => p.sell_price_min > 0);
      if (entry) this.feedUnitPrice.set(entry.sell_price_min);
      else this.feedUnitPrice.set(0);
    });

    destroyRef.onDestroy(() => {
      this.priceSub.unsubscribe();
    });

    effect(() => {
      this.currentFoodHarvestId();
      this.marketCity();
      this.feedUnitPrice.set(0);
      this.fetchTrigger.next();
    });
  }

  readonly biomeActive = computed(() => {
    const a = this.selAnimal();
    return a.biomeCities.includes(this.plantCity());
  });

  readonly result = computed(() => {
    const a = this.selAnimal();
    const n = this.heads();
    const focus = this.focus();
    const premium = this.premium();

    const premiumMult = premium ? 2 : 1;
    const taxRate = premium ? 0.04 : 0.08;
    const taxMultiplier = 1 - taxRate;

    const effectiveGrowHours = premium ? 22 : a.growHours;
    const ff = this.favoriteFood();
    const feedUnitsPerHead = ff ? a.feedUnits / 2 : a.feedUnits;
    const feedCostPerDay = Math.round(n * feedUnitsPerHead * this.feedUnitPrice());
    const babyCost = Math.round(n * this.babyPrice());
    const feedTotal = Math.round(feedCostPerDay * effectiveGrowHours / 24);
    const totalInvestment = babyCost + feedTotal;

    const biomeMult = this.biomeActive() ? 1.1 : 1;
    const baseProductPerDay = a.productPerDay * n;
    const focusMult = focus ? a.focusBonus : 1;
    const productPerDay = baseProductPerDay * focusMult * biomeMult;
    const productRevenue = Math.round(productPerDay * this.productPrice() * taxMultiplier);

    const baseOffspringChance = a.offspringChance;
    const offspringChance = focus
      ? baseOffspringChance * (a.focusBonus > 1.3 ? 1.5 : 1.3)
      : baseOffspringChance;
    const offspringPerDay = (offspringChance / 100) * n * premiumMult * biomeMult;
    const offspringRevenue = Math.round(offspringPerDay * this.babyPrice() * taxMultiplier);

    const dailyRevenue = productRevenue + offspringRevenue;
    const dailyCost = feedCostPerDay;
    const dailyProfit = dailyRevenue - dailyCost;

    const daysToRecoup = totalInvestment / (dailyProfit || 1);
    const roiPerDay = dailyProfit > 0 && totalInvestment > 0
      ? (dailyProfit / totalInvestment) * 100
      : 0;

    return {
      effectiveGrowHours,
      feedUnitsPerHead,
      babyCost,
      feedCostPerDay,
      feedTotal,
      totalInvestment,
      productPerDay,
      productRevenue,
      offspringChance,
      offspringPerDay,
      offspringRevenue,
      dailyRevenue,
      dailyCost,
      dailyProfit,
      daysToRecoup,
      roiPerDay,
    };
  });

  selectAnimal(animal: AnimalDef): void {
    this.babyPrice.set(animal.defaultBabyPrice);
    this.productPrice.set(animal.defaultProductPrice);
    this.selAnimal.set(animal);
  }

  setPlantCity(city: string): void {
    this.plantCity.set(city);
  }

  setMarketCity(city: string): void {
    this.marketCity.set(city);
  }

  cityColor(city: string): string {
    return CITY_COLORS[city] ?? 'var(--text-dim)';
  }
}
