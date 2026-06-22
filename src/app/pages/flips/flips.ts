import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  MarketFlipsService,
  MarketFlip,
  FlipType,
  FlipResult,
  ScanParams,
} from '../../core/market-flips.service';
import { AlbionDataService } from '../../core/albion-data.service';
import { TIERS } from '../../core/items.catalog';

type SortKey = 'update' | 'profit' | 'margin';

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
  imports: [DecimalPipe],
  templateUrl: './flips.html',
  styleUrl: './flips.scss',
})
export class Flips {
  private readonly service = inject(MarketFlipsService);

  readonly cities = AlbionDataService.CITIES;
  readonly tiers = TIERS;
  readonly qualities = [
    { id: 1, label: 'Normal' },
    { id: 2, label: 'Bueno' },
    { id: 3, label: 'Sobresaliente' },
    { id: 4, label: 'Excelente' },
    { id: 5, label: 'Obra maestra' },
  ];

  // ===== Parámetros de escaneo (panel 1, requieren "Fetch Flips") =====
  readonly selDirect = signal(true);
  readonly selUpgrade = signal(true);
  readonly selLocations = signal<Set<string>>(new Set(this.cities));
  readonly selQualities = signal<Set<number>>(new Set([1, 2, 3, 4, 5]));
  readonly selTiers = signal<Set<number>>(new Set(TIERS));

  // ===== Resultado =====
  readonly result = signal<FlipResult | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ===== Filtros de cliente (panel 2, en vivo) =====
  readonly search = signal('');
  readonly sortBy = signal<SortKey>('update');
  readonly minProfit = signal(0);

  // ===== Persistencia (localStorage) =====
  readonly saved = signal<Set<string>>(this.loadSet('flips.saved'));
  readonly hidden = signal<Set<string>>(this.loadSet('flips.hidden'));

  /** Popover de compra instantánea abierto (rowKey). */
  readonly openPopover = signal<string | null>(null);

  /** Suscripción del escaneo en curso (para cancelar al relanzar). */
  private scanSub?: import('rxjs').Subscription;

  /** Flips tras filtros de cliente + orden. */
  readonly displayed = computed<MarketFlip[]>(() => {
    const res = this.result();
    if (!res) return [];
    const q = this.search().trim().toLowerCase();
    const mp = this.minProfit();
    const hid = this.hidden();

    const arr = res.flips.filter(
      (f) =>
        f.profit >= mp &&
        (!q || f.name.toLowerCase().includes(q)) &&
        !hid.has(this.rowKey(f)),
    );

    const by = this.sortBy();
    return [...arr].sort((a, b) => {
      if (by === 'profit') return b.profit - a.profit;
      if (by === 'margin') return b.marginPct - a.marginPct;
      return this.time(b.updatedAt) - this.time(a.updatedAt);
    });
  });

  constructor() {
    // Carga inicial con los parámetros por defecto (como el inicio).
    this.fetchFlips();
  }

  // ===== Escaneo =====

  fetchFlips(): void {
    const scanTypes: FlipType[] = [];
    if (this.selDirect()) scanTypes.push('direct');
    if (this.selUpgrade()) scanTypes.push('upgrade');

    const locations = [...this.selLocations()];
    const qualities = [...this.selQualities()];
    const tiers = [...this.selTiers()];

    if (!scanTypes.length || !locations.length || !qualities.length || !tiers.length) {
      this.error.set('Selecciona al menos un tipo, ubicación, calidad y tier.');
      this.result.set(null);
      return;
    }

    const params: ScanParams = { scanTypes, locations, qualities, tiers };
    this.loading.set(true);
    this.error.set(null);
    // Cancela un escaneo anterior aún en vuelo para no competir por conexiones.
    this.scanSub?.unsubscribe();
    this.scanSub = this.service.getFlips(params).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los precios. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  // ===== Toggles del panel 1 =====

  toggleScan(type: FlipType): void {
    (type === 'direct' ? this.selDirect : this.selUpgrade).update((v) => !v);
  }
  toggleLocation(city: string): void {
    this.toggleIn(this.selLocations, city);
  }
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

  // ===== Filtros de cliente =====

  setSearch(target: EventTarget | null): void {
    this.search.set((target as HTMLInputElement).value);
  }
  setSort(target: EventTarget | null): void {
    this.sortBy.set((target as HTMLSelectElement).value as SortKey);
  }
  setMinProfit(target: EventTarget | null): void {
    this.minProfit.set(Number((target as HTMLInputElement).value) || 0);
  }

  resetFilters(): void {
    // Panel 1 a por defecto.
    this.selDirect.set(true);
    this.selUpgrade.set(true);
    this.selLocations.set(new Set(this.cities));
    this.selQualities.set(new Set([1, 2, 3, 4, 5]));
    this.selTiers.set(new Set(TIERS));
    // Panel 2 a por defecto.
    this.search.set('');
    this.sortBy.set('update');
    this.minProfit.set(0);
  }

  // ===== Acciones de fila (persistentes) =====

  rowKey(f: MarketFlip): string {
    return `${f.itemId}|${f.quality}|${f.type}`;
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
      'type',
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
          f.type,
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
    3: 'Sobresaliente',
    4: 'Excelente',
    5: 'Obra maestra',
  };
  qualityLabel(q: number): string {
    return this.QUALITY_LABELS[q] ?? 'Normal';
  }

  /** Texto de la ruta de encantamiento, p.ej. ".0 → .3 · 3 pasos". */
  upgradeLabel(f: MarketFlip): string {
    const to = (f.upgradeFromEnchant ?? 0) + (f.upgradeSteps ?? 0);
    const steps = f.upgradeSteps ?? 0;
    return `.${f.upgradeFromEnchant} → .${to} · ${steps} ${steps === 1 ? 'paso' : 'pasos'}`;
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
