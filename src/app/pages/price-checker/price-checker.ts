import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AlbionDataService, HistoryEntry, PriceEntry } from '../../core/albion-data.service';
import { ALL_ITEMS, ENCHANTS, displayName } from '../../core/items.catalog';

/** Opción del buscador: una variante de item (con tier y encantamiento). */
interface ItemOption {
  /** Id completo (con encantamiento), p.ej. "T6_MAIN_DAGGER@2". */
  id: string;
  /** Nombre mostrado, p.ej. "Daga del maestro (T6.2)". */
  name: string;
}

/** Una fila de resultado: precio del item en una ciudad+calidad concretas. */
interface PriceRow {
  city: string;
  quality: number;
  buyMin: number;
  buyMax: number;
  buyDate: string;
  sellMin: number;
  sellMax: number;
  sellDate: string;
  /** Unidades vendidas en las últimas 24h (según el histórico diario). */
  volumeUnits: number;
  /** Plata movida en las últimas 24h (unidades × precio medio). */
  volumeSilver: number;
  /** Fecha del dato más reciente de esta fila (para "actualizado hace…"). */
  updatedAt: string | null;
  hasData: boolean;
  /**
   * Posible dato atípico: precio de venta muy por encima del de compra en la
   * misma fila. Suele indicar un listado aislado (o "troll") en un item poco
   * negociado, no el precio real de mercado. AODP solo escanea lo que abren
   * los clientes del juego, así que estos casos no se pueden corregir, solo
   * avisar.
   */
  suspect: boolean;
}

/** Umbral venta/compra a partir del cual avisamos de precio atípico. */
const SUSPECT_RATIO = 4;

type ViewMode = 'grid' | 'list';
type SortMode = 'default' | 'volume' | 'buyPrice' | 'sellPrice';

const MAX_RECENT = 25;
const MAX_FAVORITES = 25;

@Component({
  selector: 'app-price-checker',
  imports: [DecimalPipe],
  templateUrl: './price-checker.html',
  styleUrl: './price-checker.scss',
})
export class PriceChecker {
  private readonly api = inject(AlbionDataService);

  /** Expuesto para la plantilla (tooltip de los iconos de recientes/favoritos). */
  readonly displayName = displayName;

  readonly cities = AlbionDataService.CITIES;
  readonly qualities = [
    { id: 1, label: 'Normal' },
    { id: 2, label: 'Bueno' },
    { id: 3, label: 'Notable' },
    { id: 4, label: 'Sobresaliente' },
    { id: 5, label: 'Obra maestra' },
  ];
  private readonly qualityLabels: Record<number, string> = {
    1: 'Normal',
    2: 'Bueno',
    3: 'Notable',
    4: 'Sobresaliente',
    5: 'Obra maestra',
  };

  /** Color identificativo de cada ciudad. */
  private readonly cityColors: Record<string, string> = {
    'Fort Sterling': '#d8dde8',
    Lymhurst: '#7ed957',
    Bridgewatch: '#e8a33d',
    Martlock: '#4f8cff',
    Thetford: '#b06fe8',
    Caerleon: '#e8434f',
    Brecilien: '#3fc7b4',
    'Black Market': '#2b2f3a',
  };

  /** Buscador: TODAS las variantes vendibles del juego (tier + encantamiento). */
  private readonly itemOptions: ItemOption[] = ALL_ITEMS.flatMap((it) =>
    ENCHANTS.map((e) => {
      const id = e === 0 ? it.id : `${it.id}@${e}`;
      return { id, name: displayName(id) };
    }),
  ).sort((a, b) => a.name.localeCompare(b.name, 'es'));

  readonly search = signal('');
  readonly searchOpen = signal(false);

  readonly suggestions = computed<ItemOption[]>(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return [];
    return this.itemOptions.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 60);
  });

  /** Ids (más reciente primero) de los items consultados. */
  readonly recent = signal<string[]>(this.loadList('pricechecker.recent'));
  /** Ids marcados como favoritos. */
  readonly favorites = signal<Set<string>>(new Set(this.loadList('pricechecker.favorites')));

  readonly favoriteItems = computed<ItemOption[]>(() =>
    [...this.favorites()].map((id) => ({ id, name: displayName(id) })),
  );

  /** Item seleccionado para ver su precio (null = nada seleccionado). */
  readonly selected = signal<ItemOption | null>(null);
  readonly loadingPrices = signal(false);
  readonly priceError = signal<string | null>(null);
  private pricesSub?: import('rxjs').Subscription;

  private readonly prices = signal<PriceEntry[]>([]);
  private readonly history = signal<HistoryEntry[]>([]);

  // ===== Filtros del panel de resultados =====

  readonly viewMode = signal<ViewMode>('grid');
  readonly sortBy = signal<SortMode>('default');
  readonly metricBuy = signal(true);
  readonly metricSell = signal(true);
  readonly metricVolume = signal(true);
  readonly includeEmpty = signal(false);
  readonly selQualities = signal<Set<number>>(new Set([1, 2, 3, 4, 5]));
  readonly selLocations = signal<Set<string>>(new Set(this.cities));

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }
  setSortBy(target: EventTarget | null): void {
    this.sortBy.set((target as HTMLSelectElement).value as SortMode);
  }
  toggleMetric(metric: 'buy' | 'sell' | 'volume'): void {
    const sig = metric === 'buy' ? this.metricBuy : metric === 'sell' ? this.metricSell : this.metricVolume;
    sig.update((v) => !v);
  }
  toggleIncludeEmpty(): void {
    this.includeEmpty.update((v) => !v);
  }
  toggleQualityFilter(q: number): void {
    this.toggleIn(this.selQualities, q);
  }
  toggleLocationFilter(city: string): void {
    this.toggleIn(this.selLocations, city);
  }
  private toggleIn<T>(sig: { (): Set<T>; set: (v: Set<T>) => void }, val: T): void {
    const next = new Set(sig());
    next.has(val) ? next.delete(val) : next.add(val);
    sig.set(next);
  }

  /** Filas ciudad×calidad del item seleccionado, filtradas y ordenadas. */
  readonly rows = computed<PriceRow[]>(() => {
    const priceById = new Map<string, PriceEntry>();
    for (const p of this.prices()) priceById.set(`${p.city}|${p.quality}`, p);

    const volById = new Map<string, { units: number; avg: number; date: string }>();
    for (const h of this.history()) {
      const last = h.data[h.data.length - 1];
      if (!last) continue;
      volById.set(`${h.location}|${h.quality}`, {
        units: last.item_count,
        avg: last.avg_price,
        date: last.timestamp,
      });
    }

    const qs = this.selQualities();
    const locs = this.selLocations();

    const out: PriceRow[] = [];
    for (const city of this.cities) {
      if (!locs.has(city)) continue;
      for (const q of this.qualities) {
        if (!qs.has(q.id)) continue;
        const key = `${city}|${q.id}`;
        const p = priceById.get(key);
        const v = volById.get(key);

        const buyMin = p?.buy_price_min ?? 0;
        const buyMax = p?.buy_price_max ?? 0;
        const sellMin = p?.sell_price_min ?? 0;
        const sellMax = p?.sell_price_max ?? 0;
        const volumeUnits = v?.units ?? 0;
        const volumeSilver = v ? Math.round(v.units * v.avg) : 0;
        const hasData = !!buyMax || !!sellMin || !!volumeUnits;
        if (!hasData && !this.includeEmpty()) continue;

        const dates = [p?.buy_price_max_date, p?.sell_price_min_date, v?.date].filter(
          (d): d is string => !!d,
        );
        const updatedAt = dates.length
          ? dates.reduce((a, b) => (this.time(a) > this.time(b) ? a : b))
          : null;
        const suspect = !!buyMax && !!sellMin && sellMin > buyMax * SUSPECT_RATIO;

        out.push({
          city,
          quality: q.id,
          buyMin,
          buyMax,
          buyDate: p?.buy_price_max_date ?? '',
          sellMin,
          sellMax,
          sellDate: p?.sell_price_min_date ?? '',
          volumeUnits,
          volumeSilver,
          updatedAt,
          hasData,
          suspect,
        });
      }
    }

    const by = this.sortBy();
    if (by === 'volume') return out.sort((a, b) => b.volumeUnits - a.volumeUnits);
    if (by === 'buyPrice') return out.sort((a, b) => b.buyMax - a.buyMax);
    if (by === 'sellPrice') {
      return out.sort((a, b) => {
        const av = a.sellMin || Infinity;
        const bv = b.sellMin || Infinity;
        return av - bv;
      });
    }
    return out.sort((a, b) => {
      const c = a.city.localeCompare(b.city);
      return c !== 0 ? c : a.quality - b.quality;
    });
  });

  setSearch(target: EventTarget | null): void {
    this.search.set((target as HTMLInputElement).value);
    this.searchOpen.set(true);
  }
  openSearch(): void {
    this.searchOpen.set(true);
  }
  clearSearch(): void {
    this.search.set('');
    this.searchOpen.set(false);
  }

  selectOption(opt: ItemOption): void {
    this.search.set('');
    this.searchOpen.set(false);
    this.checkItem(opt);
  }
  selectRecent(id: string): void {
    this.checkItem({ id, name: displayName(id) });
  }

  /** Marca un item como consultado y carga su precio + volumen actuales. */
  checkItem(opt: ItemOption): void {
    this.selected.set(opt);
    this.recent.update((cur) => {
      const next = [opt.id, ...cur.filter((id) => id !== opt.id)].slice(0, MAX_RECENT);
      this.saveList('pricechecker.recent', next);
      return next;
    });

    this.loadingPrices.set(true);
    this.priceError.set(null);
    this.pricesSub?.unsubscribe();
    this.pricesSub = forkJoin([
      this.api.getPrices([opt.id], this.cities, [1, 2, 3, 4, 5]),
      this.api.getHistory(opt.id, this.cities, [1, 2, 3, 4, 5], 24),
    ]).subscribe({
      next: ([prices, history]) => {
        this.prices.set(prices);
        this.history.set(history);
        this.loadingPrices.set(false);
      },
      error: () => {
        this.priceError.set('No se pudo cargar el precio. Inténtalo de nuevo.');
        this.loadingPrices.set(false);
      },
    });
  }

  closeSelected(): void {
    this.selected.set(null);
    this.prices.set([]);
    this.history.set([]);
    this.pricesSub?.unsubscribe();
  }

  isFavorite(id: string): boolean {
    return this.favorites().has(id);
  }
  toggleFavorite(id: string, ev: Event): void {
    ev.stopPropagation();
    this.favorites.update((cur) => {
      const next = new Set(cur);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_FAVORITES) {
        next.add(id);
      }
      this.saveList('pricechecker.favorites', [...next]);
      return next;
    });
  }

  iconUrl(id: string): string {
    return `https://render.albiononline.com/v1/item/${id}.png?size=120`;
  }
  qualityLabel(q: number): string {
    return this.qualityLabels[q] ?? 'Normal';
  }
  cityColor(city: string): string {
    return this.cityColors[city] ?? 'var(--text-dim)';
  }

  /** "hace X" a partir de una fecha ISO (UTC) o null si no hay dato. */
  ago(iso: string | null): string {
    if (!iso) return 'sin datos';
    const min = Math.max(0, Math.round((Date.now() - this.time(iso)) / 60000));
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  }
  private time(iso: string): number {
    return new Date(iso + 'Z').getTime();
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.searchOpen.set(false);
  }

  // ===== localStorage =====

  private loadList(key: string): string[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }
  private saveList(key: string, list: string[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
