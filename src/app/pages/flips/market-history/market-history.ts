import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AlbionDataService, HistoryPoint } from '../../../core/albion-data.service';
import { MarketFlip } from '../../../core/market-flips.service';
import { ENCHANT_MATS, ITEM_BY_ID, baseOf, displayName, enchantQty } from '../../../core/items.catalog';
import { iconUrl as makeIconUrl } from '../../../core/icon-url';

interface Scale {
  label: string;
  timeScale: number;
  points: number;
}

interface ChartPoint {
  x: number;
  priceY: number;
  barY: number;
  barH: number;
  price: number;
  count: number;
  time: string;
}

interface EnchantRow {
  level: number;
  matCost: number;
  totalCost: number;
  bmPrice: number;
  profit: number;
  marginPct: number;
}

@Component({
  selector: 'app-market-history',
  imports: [DecimalPipe],
  templateUrl: './market-history.html',
  styleUrl: './market-history.scss',
})
export class MarketHistory implements OnInit {
  private readonly api = inject(AlbionDataService);

  readonly flip = input.required<MarketFlip>();
  readonly iconId = input<string>('');
  readonly citiesInput = input<string[]>([]);
  readonly toggleItemId = input<string>('');
  readonly toggleLabel = input<string>('');
  readonly toggleItemId2 = input<string>('');
  readonly toggleLabel2 = input<string>('');
  readonly wikiRoute = input<string>('');
  readonly wikiRouteToggle = input<string>('');
  readonly close = output<void>();

  readonly relatedIndex = signal(0);
  readonly tab = signal<'history' | 'enchant'>('history');

  readonly scales: Scale[] = [
    { label: '4 semanas', timeScale: 24, points: 28 },
    { label: '7 días', timeScale: 6, points: 28 },
    { label: '24 horas', timeScale: 1, points: 24 },
  ];

  readonly scale = signal<Scale>(this.scales[0]);

  readonly cities = computed<string[]>(() => {
    const override = this.citiesInput();
    return override.length ? override : AlbionDataService.CITIES;
  });
  readonly selectedCity = signal<string>('');

  readonly points = signal<HistoryPoint[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly hover = signal<number | null>(null);

  private sub?: import('rxjs').Subscription;

  readonly W = 620;
  readonly H = 230;
  private readonly padL = 38;
  private readonly padR = 16;
  private readonly padT = 16;
  private readonly padB = 30;

  // Enchant calculator
  readonly baseItemId = computed(() => baseOf(this.flip().itemId));
  readonly baseName = computed(() => displayName(this.baseItemId()));
  readonly enchMats = computed(() => ENCHANT_MATS[this.flip().tier]);
  readonly buyCity = computed(() => this.flip().buyCity);

  readonly basePrice = signal(0);
  readonly runePrice = signal(0);
  readonly soulPrice = signal(0);
  readonly relicPrice = signal(0);
  readonly bmPriceLevel = signal<Record<number, number>>({});

  readonly runeInput = signal(0);
  readonly soulInput = signal(0);
  readonly relicInput = signal(0);

  readonly loadingEnchant = signal(false);
  readonly enchError = signal<string | null>(null);

  ngOnInit(): void {
    this.selectedCity.set(this.flip().sellCity);
    this.load();
    this.loadEnchantPrices();
  }

  cityName(): string {
    return this.selectedCity();
  }

  setScale(s: Scale): void {
    this.scale.set(s);
    this.load();
  }
  setCity(target: EventTarget | null): void {
    const city = (target as HTMLSelectElement).value;
    if (city === this.selectedCity()) return;
    this.selectedCity.set(city);
    this.load();
  }

  private load(): void {
    const id = this.currentItemId();
    const city = this.cityName();
    const s = this.scale();
    this.loading.set(true);
    this.error.set(null);
    this.hover.set(null);
    this.sub?.unsubscribe();
    this.sub = this.api.getHistory(id, [city], [this.flip().quality], s.timeScale).subscribe({
      next: (entries) => {
        const entry = entries.find((e) => e.location === city) ?? entries[0];
        const raw = entry?.data ?? [];
        const cutoff = Date.now() - s.points * s.timeScale * 3600000;
        const filtered = raw.filter((p) => {
          const t = new Date(p.timestamp + 'Z').getTime();
          return t >= cutoff;
        });
        this.points.set(filtered);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial.');
        this.loading.set(false);
      },
    });
  }

  private loadEnchantPrices(): void {
    const mats = this.enchMats();
    const tier = this.flip().tier;
    const city = this.buyCity();
    const quality = this.flip().quality;
    if (!mats) return;

    this.loadingEnchant.set(true);
    this.enchError.set(null);

    const enchIds = [1, 2, 3].map((e) => `${this.baseItemId()}@${e}`);

    this.api.getPrices(
      [this.baseItemId(), mats.rune, mats.soul, mats.relic, ...enchIds],
      [city, 'Black Market'],
      quality === 1 ? [1] : [quality, 1],
    ).subscribe({
      next: (entries) => {
        const base = entries.find(
          (e) => e.item_id === this.baseItemId() && e.city === city && e.quality === quality,
        );
        if (base) this.basePrice.set(base.sell_price_min);

        const rune = entries.find(
          (e) => e.item_id === mats.rune && e.city === city && e.quality === 1,
        );
        const soul = entries.find(
          (e) => e.item_id === mats.soul && e.city === city && e.quality === 1,
        );
        const relic = entries.find(
          (e) => e.item_id === mats.relic && e.city === city && e.quality === 1,
        );

        const rp = rune?.sell_price_min ?? 0;
        const sp = soul?.sell_price_min ?? 0;
        const rlp = relic?.sell_price_min ?? 0;

        this.runePrice.set(rp);
        this.soulPrice.set(sp);
        this.relicPrice.set(rlp);
        this.runeInput.set(rp);
        this.soulInput.set(sp);
        this.relicInput.set(rlp);

        const bm: Record<number, number> = {};
        for (const e of [1, 2, 3]) {
          const id = `${this.baseItemId()}@${e}`;
          const bmEntry = entries.find(
            (e2) => e2.item_id === id && e2.city === 'Black Market' && e2.quality === quality,
          );
          if (bmEntry) bm[e] = bmEntry.buy_price_max || bmEntry.sell_price_min;
        }
        this.bmPriceLevel.set(bm);
        this.loadingEnchant.set(false);
      },
      error: () => {
        this.enchError.set('No se pudieron cargar los precios de materiales.');
        this.loadingEnchant.set(false);
      },
    });
  }

  readonly enchantResults = computed<EnchantRow[]>(() => {
    const base = this.basePrice();
    const bm = this.bmPriceLevel();
    const r = this.runeInput();
    const s = this.soulInput();
    const re = this.relicInput();
    const catalog = ITEM_BY_ID.get(this.baseItemId());
    const qty = catalog ? enchantQty(catalog.typeKey) : 0;

    if (!base || !qty) return [];

    const out: EnchantRow[] = [];
    for (let e = 1; e <= 3; e++) {
      let matCost = 0;
      if (e >= 1) matCost += qty * r;
      if (e >= 2) matCost += qty * s;
      if (e >= 3) matCost += qty * re;

      const totalCost = base + matCost;
      const bmPrice = bm[e] || 0;
      const profit = bmPrice - totalCost;

      out.push({
        level: e,
        matCost,
        totalCost,
        bmPrice,
        profit,
        marginPct: totalCost ? +((profit / totalCost) * 100).toFixed(2) : 0,
      });
    }
    return out;
  });

  readonly avgPrice = computed<number>(() => {
    const pts = this.points();
    if (!pts.length) return 0;
    return Math.round(pts.reduce((s, p) => s + p.avg_price, 0) / pts.length);
  });

  readonly chart = computed(() => {
    const pts = this.points();
    if (!pts.length) return null;

    const innerW = this.W - this.padL - this.padR;
    const innerH = this.H - this.padT - this.padB;
    const n = pts.length;
    const priceMax = Math.max(...pts.map((p) => p.avg_price), 1);
    const countMax = Math.max(...pts.map((p) => p.item_count), 1);
    const barAreaH = innerH * 0.5;
    const stepX = n > 1 ? innerW / (n - 1) : 0;

    const fmt = (iso: string): string => {
      const d = new Date(iso + 'Z');
      return this.scale().timeScale === 1
        ? `${d.getHours()}:00`
        : `${d.getDate()}/${d.getMonth() + 1}`;
    };

    const items: ChartPoint[] = pts.map((p, i) => {
      const x = n > 1 ? this.padL + i * stepX : this.padL + innerW / 2;
      const priceY = this.padT + (1 - p.avg_price / priceMax) * innerH;
      const barH = (p.item_count / countMax) * barAreaH;
      return {
        x,
        priceY,
        barH,
        barY: this.padT + innerH - barH,
        price: p.avg_price,
        count: p.item_count,
        time: fmt(p.timestamp),
      };
    });

    const linePath = items
      .map((it, i) => `${i ? 'L' : 'M'}${it.x.toFixed(1)} ${it.priceY.toFixed(1)}`)
      .join(' ');

    const ticks = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1]
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((i) => ({ x: items[i].x, label: items[i].time }));

    return {
      items,
      linePath,
      priceMax,
      barW: Math.max(3, stepX * 0.55),
      ticks,
      baseY: this.padT + innerH,
      topY: this.padT,
    };
  });

  readonly tip = computed(() => {
    const h = this.hover();
    const c = this.chart();
    if (h == null || !c) return null;
    const it = c.items[h];
    const left = it.x > this.W * 0.6;
    return { x: it.x, y: it.priceY, price: it.price, count: it.count, time: it.time, left };
  });

  setHover(i: number): void {
    this.hover.set(i);
  }
  clearHover(): void {
    this.hover.set(null);
  }

  onClose(): void {
    this.sub?.unsubscribe();
    this.close.emit();
  }

  readonly currentItemId = computed<string>(() => {
    const i = this.relatedIndex();
    if (i === 1) return this.toggleItemId();
    if (i === 2) return this.toggleItemId2();
    return this.flip().itemId;
  });

  readonly activeWikiRoute = computed(() => {
    const i = this.relatedIndex();
    if (i === 1) return this.wikiRouteToggle();
    if (i === 2) return this.wikiRouteToggle();
    return this.wikiRoute();
  });

  setRelatedIndex(i: number): void {
    this.relatedIndex.set(i);
    this.load();
  }
  iconUrl(): string {
    const i = this.relatedIndex();
    const id = i === 1 ? this.toggleItemId() : i === 2 ? this.toggleItemId2() : '';
    return makeIconUrl(id || this.iconId() || this.flip().itemId, 64);
  }

  inputVal(ev: Event): number {
    return Number((ev.target as HTMLInputElement).value) || 0;
  }
}
