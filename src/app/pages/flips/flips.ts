import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  MarketFlipsService,
  MarketFlip,
  FlipResult,
  ScanParams,
} from '../../core/market-flips.service';
import { ALL_ITEMS, ENCHANTS, TIERS, displayName } from '../../core/items.catalog';
import { MarketHistory } from './market-history/market-history';
import { iconUrl as makeIconUrl, preloadIcons } from '../../core/icon-url';

type SortKey = 'update' | 'profit' | 'margin' | 'volume';

/** Opción del buscador: una variante de item (con tier y encantamiento). */
interface ItemOption {
  /** Id completo (con encantamiento), p.ej. "T6_MAIN_DAGGER@2". */
  id: string;
  /** Nombre mostrado, p.ej. "Daga del maestro (T6.2)". */
  name: string;
}

const BUY_CITIES = ['Bridgewatch', 'Martlock', 'Thetford', 'Lymhurst', 'Fort Sterling', 'Caerleon', 'Brecilien'];

/** Color identificativo de cada ciudad (puntos de la lista de ubicaciones). */
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
  selector: 'app-flips',
  imports: [DecimalPipe, MarketHistory],
  templateUrl: './flips.html',
  styleUrl: './flips.scss',
})
export class Flips {
  private readonly service = inject(MarketFlipsService);

  readonly tiers = TIERS;
  readonly buyCities = BUY_CITIES;
  readonly qualities = [
    { id: 1, label: 'Normal' },
    { id: 2, label: 'Bueno' },
    { id: 3, label: 'Notable' },
    { id: 4, label: 'Sobresaliente' },
    { id: 5, label: 'Obra maestra' },
  ];

  // ===== Parámetros de escaneo (panel 1, requieren "Fetch Flips") =====
  readonly selQualities = signal<Set<number>>(new Set([1, 2, 3, 4, 5]));
  readonly selTiers = signal<Set<number>>(new Set(TIERS));
  readonly buyCity = signal<string | null>(null);
  readonly buyCityOpen = signal(false);

  // ===== Resultado =====
  readonly result = signal<FlipResult | null>(null);
  readonly loading = signal(false);
  /** Sigue llegando datos del escaneo (emisiones parciales en curso). */
  readonly streaming = signal(false);
  readonly error = signal<string | null>(null);

  // ===== Filtros de cliente (panel 2, en vivo) =====
  readonly search = signal('');
  readonly sortBy = signal<SortKey>('update');
  readonly minProfit = signal(0);
  /** Relleno del slider (0-100%), para pintar la barra de progreso. */
  readonly minProfitPct = computed(() => (this.minProfit() / 1_000_000) * 100);

  /** Buscador: TODAS las variantes del juego (tier + encantamiento). */
  readonly itemOptions: ItemOption[] = ALL_ITEMS.flatMap((it) =>
    ENCHANTS.map((e) => {
      const id = e === 0 ? it.id : `${it.id}@${e}`;
      return { id, name: displayName(id) };
    }),
  ).sort((a, b) => a.name.localeCompare(b.name, 'es'));

  /** ¿Está abierto el desplegable del buscador? */
  readonly searchOpen = signal(false);

  /** Opciones que coinciden con lo escrito (máx. 60 para no saturar). */
  readonly suggestions = computed<ItemOption[]>(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.itemOptions;
    const matches = q ? all.filter((o) => o.name.toLowerCase().includes(q)) : all;
    return matches.slice(0, 60);
  });

  /** Filas que se muestran de golpe / se añaden con "Ver más". */
  private readonly PAGE_STEP = 15;
  readonly visibleCount = signal(this.PAGE_STEP);

  // ===== Persistencia (localStorage) =====
  readonly saved = signal<Set<string>>(this.loadSet('flips.saved'));
  readonly hidden = signal<Set<string>>(this.loadSet('flips.hidden'));

  /** Popover de compra instantánea abierto (rowKey). */
  readonly openPopover = signal<string | null>(null);

  /** Flip cuyo historial de mercado se muestra en el modal (null = cerrado). */
  readonly historyFlip = signal<MarketFlip | null>(null);

  openHistory(f: MarketFlip): void {
    this.historyFlip.set(f);
  }
  closeHistory(): void {
    this.historyFlip.set(null);
  }

  /** Suscripción del escaneo en curso (para cancelar al relanzar). */
  private scanSub?: import('rxjs').Subscription;

  /** Flips tras filtros de cliente + orden. */
  readonly displayed = computed<MarketFlip[]>(() => {
    const source = this.result()?.flips ?? [];

    const q = this.search().trim().toLowerCase();
    const mp = this.minProfit();
    const hid = this.hidden();
    const city = this.buyCity();

    const arr = source.filter(
      (f) =>
        f.profit >= mp &&
        (!q || f.name.toLowerCase().includes(q)) &&
        !hid.has(this.rowKey(f)) &&
        (!city || f.buyCity === city),
    );

    const by = this.sortBy();
    return [...arr].sort((a, b) => {
      if (by === 'profit') return b.profit - a.profit;
      if (by === 'margin') return b.marginPct - a.marginPct;
      if (by === 'volume') return b.volume24h - a.volume24h;
      return this.time(b.updatedAt) - this.time(a.updatedAt);
    });
  });

  /** Filas realmente pintadas (paginación incremental sobre `displayed`). */
  readonly visible = computed<MarketFlip[]>(() => this.displayed().slice(0, this.visibleCount()));

  /** ¿Quedan más filas tras las visibles? */
  readonly hasMore = computed(() => this.displayed().length > this.visibleCount());

  showMore(): void {
    this.visibleCount.update((n) => n + this.PAGE_STEP);
  }

  /** Vuelve a empezar por las primeras 15 (al filtrar o reescanear). */
  private resetPage(): void {
    this.visibleCount.set(this.PAGE_STEP);
  }

  constructor() {
    // Carga inicial con los parámetros por defecto (como el inicio).
    this.fetchFlips();
  }

  // ===== Escaneo =====

  fetchFlips(): void {
    const qualities = [...this.selQualities()];
    const tiers = [...this.selTiers()];

    if (!qualities.length || !tiers.length) {
      this.error.set('Selecciona al menos una calidad y un tier.');
      this.result.set(null);
      return;
    }

    const params: ScanParams = { qualities, tiers };
    this.loading.set(true);
    this.streaming.set(true);
    this.error.set(null);
    this.resetPage();
    // Cancela un escaneo anterior aún en vuelo para no competir por conexiones.
    this.scanSub?.unsubscribe();
    this.scanSub = this.service.getFlips(params).subscribe({
      next: (res) => {
        // Cada emisión es un resultado parcial que va creciendo.
        this.result.set(res);
        // No marcar como "cargado" hasta que tengamos datos reales o el
        // escaneo termine, para evitar mostrar "sin oportunidades" mientras
        // aún están llegando lotes de precios.
        if (res.flips.length > 0) {
          this.loading.set(false);
        }
        if (res.flips.length) {
          try {
            preloadIcons(res.flips.slice(0, this.PAGE_STEP).map((f) => f.itemId), 64);
          } catch { /* fallo de precarga no crítico */ }
        }
      },
      error: () => {
        this.error.set('No se pudieron cargar los precios. Inténtalo de nuevo.');
        this.loading.set(false);
        this.streaming.set(false);
      },
      complete: () => {
        this.streaming.set(false);
        this.loading.set(false);
      },
    });
  }

  // ===== Toggles del panel 1 =====

  toggleQuality(q: number): void {
    this.toggleIn(this.selQualities, q);
  }
  toggleTier(t: number): void {
    this.toggleIn(this.selTiers, t);
  }

  private toggleIn<T>(sig: { (): Set<T>; set: (v: Set<T>) => void }, val: T): void {
    const next = new Set(sig());
    next.has(val) ? next.delete(val) : next.add(val);
    sig.set(next);
  }

  selectBuyCity(city: string | null): void {
    this.buyCity.set(city);
    this.buyCityOpen.set(false);
    this.resetPage();
  }

  // ===== Filtros de cliente =====

  setSearch(target: EventTarget | null): void {
    this.search.set((target as HTMLInputElement).value);
    this.searchOpen.set(true);
    this.resetPage();
  }
  /** Abre el desplegable al enfocar el buscador. */
  openSearch(): void {
    this.searchOpen.set(true);
  }
  /** Selecciona un item del desplegable: filtra por su nombre. */
  selectItem(opt: ItemOption): void {
    this.search.set(opt.name);
    this.searchOpen.set(false);
    this.resetPage();
  }
  /** Limpia el buscador. */
  clearSearch(): void {
    this.search.set('');
    this.searchOpen.set(false);
    this.resetPage();
  }
  /** URL del icono de un item (con su encantamiento). */
  iconUrl(id: string): string {
    return makeIconUrl(id, 64);
  }
  setSort(target: EventTarget | null): void {
    this.sortBy.set((target as HTMLSelectElement).value as SortKey);
    this.resetPage();
  }
  setMinProfit(target: EventTarget | null): void {
    this.minProfit.set(Number((target as HTMLInputElement).value) || 0);
    this.resetPage();
  }

  resetFilters(): void {
    // Panel 1 a por defecto.
    this.selQualities.set(new Set([1, 2, 3, 4, 5]));
    this.selTiers.set(new Set(TIERS));
    this.buyCity.set(null);
    // Panel 2 a por defecto.
    this.search.set('');
    this.sortBy.set('update');
    this.minProfit.set(0);
    this.resetPage();
  }

  // ===== Acciones de fila (persistentes) =====

  rowKey(f: MarketFlip): string {
    // Incluye buyCity: puede haber varias filas del mismo item+calidad, una
    // por cada ciudad de compra rentable.
    return `${f.itemId}|${f.quality}|${f.buyCity}`;
  }
  isSaved(f: MarketFlip): boolean {
    return this.saved().has(this.rowKey(f));
  }
  toggleSave(f: MarketFlip, ev: Event): void {
    ev.stopPropagation();
    this.toggleIn(this.saved, this.rowKey(f));
    this.persist('flips.saved', this.saved());
  }
  hideRow(f: MarketFlip, ev: Event): void {
    ev.stopPropagation();
    this.toggleIn(this.hidden, this.rowKey(f));
    this.persist('flips.hidden', this.hidden());
  }
  clearHidden(): void {
    this.hidden.set(new Set());
    this.persist('flips.hidden', this.hidden());
  }

  // ===== Exportar =====

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.displayed(), null, 2)], {
      type: 'application/json',
    });
    this.download(blob, 'profialbion-flips.json');
  }

  exportCsv(): void {
    const cols = [
      'item',
      'tier',
      'quality',
      'buyCity',
      'buyPrice',
      'sellCity',
      'sellPrice',
      'profit',
      'marginPct',
      'updatedAt',
    ];
    const escape = (v: unknown): string => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [cols.join(',')];
    for (const f of this.displayed()) {
      lines.push(
        [
          f.name,
          f.tier,
          f.quality,
          f.buyCity,
          f.buyPrice,
          f.sellCity,
          f.sellPrice,
          f.profit,
          f.marginPct,
          f.updatedAt,
        ]
          .map(escape)
          .join(','),
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    this.download(blob, 'profialbion-flips.csv');
  }

  private download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ===== Popover compra instantánea =====

  togglePopover(key: string, ev: Event): void {
    ev.stopPropagation();
    this.openPopover.update((cur) => (cur === key ? null : key));
  }
  @HostListener('document:click')
  closePopover(): void {
    this.openPopover.set(null);
    this.searchOpen.set(false);
    this.buyCityOpen.set(false);
  }

  // ===== Atajo de teclado: "A" = Fetch Flips =====

  @HostListener('document:keydown', ['$event'])
  onKey(ev: KeyboardEvent): void {
    if (ev.key.toLowerCase() !== 'a' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const el = ev.target as HTMLElement;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
    ev.preventDefault();
    this.fetchFlips();
  }

  // ===== Helpers de presentación =====

  cityColor(city: string): string {
    return CITY_COLORS[city] ?? 'var(--text-dim)';
  }

  private readonly QUALITY_LABELS: Record<number, string> = {
    1: 'Normal',
    2: 'Bueno',
    3: 'Notable',
    4: 'Sobresaliente',
    5: 'Obra maestra',
  };
  qualityLabel(q: number): string {
    return this.QUALITY_LABELS[q] ?? 'Normal';
  }

  freshness(iso: string): 'fresh' | 'mid' | 'old' {
    const min = (Date.now() - this.time(iso)) / 60000;
    if (min <= 60) return 'fresh';
    if (min <= 6 * 60) return 'mid';
    return 'old';
  }

  ago(iso: string): string {
    const min = Math.max(0, Math.round((Date.now() - this.time(iso)) / 60000));
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  }

  /** "hace X" del momento de la última obtención de datos. */
  fetchedAgo(): string {
    const res = this.result();
    if (!res) return '';
    const min = Math.max(0, Math.round((Date.now() - res.fetchedAt) / 60000));
    if (min < 1) return 'hace segundos';
    if (min < 60) return `hace ${min} min`;
    return `hace ${Math.round(min / 60)} h`;
  }

  private time(iso: string): number {
    return new Date(iso + 'Z').getTime();
  }

  // ===== localStorage =====

  private loadSet<T>(key: string): Set<T> {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? (JSON.parse(raw) as T[]) : []);
    } catch {
      return new Set();
    }
  }
  private persist<T>(key: string, set: Set<T>): void {
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      /* almacenamiento no disponible */
    }
  }
}
