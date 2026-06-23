import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarketFlipsService, MarketFlip } from '../../core/market-flips.service';

/** Color identificativo de cada ciudad (puntos junto al nombre). */
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
  selector: 'app-home',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly flipsService = inject(MarketFlipsService);

  /** Cuántas oportunidades pedimos a la API. */
  private readonly FETCH_LIMIT = 40;
  /** Filas que se añaden cada vez que se pulsa "Ver más". */
  private readonly PAGE_STEP = 8;

  readonly flips = signal<MarketFlip[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Cuántas filas se muestran (paginación incremental). */
  readonly visibleCount = signal(this.PAGE_STEP);

  /** Filas realmente visibles según la paginación. */
  readonly visible = computed<MarketFlip[]>(() => this.flips().slice(0, this.visibleCount()));

  /** ¿Quedan más filas por mostrar tras las visibles? */
  readonly hasMore = computed(() => this.flips().length > this.visibleCount());

  /** itemId de la fila con el bocadillo de "compra instantánea" abierto. */
  readonly openPopover = signal<string | null>(null);

  togglePopover(itemId: string, ev: Event): void {
    ev.stopPropagation();
    this.openPopover.update((cur) => (cur === itemId ? null : itemId));
  }

  @HostListener('document:click')
  closePopover(): void {
    this.openPopover.set(null);
  }

  constructor() {
    this.loadFlips();
  }

  loadFlips(): void {
    this.loading.set(true);
    this.error.set(null);
    this.visibleCount.set(this.PAGE_STEP);
    this.flipsService.getTopFlips(this.FETCH_LIMIT).subscribe({
      next: (flips) => {
        this.flips.set(flips);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los precios. Inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  showMore(): void {
    this.visibleCount.update((n) => n + this.PAGE_STEP);
  }

  private readonly QUALITY_LABELS: Record<number, string> = {
    1: 'Normal',
    2: 'Bueno',
    3: 'Notable',
    4: 'Sobresaliente',
    5: 'Obra maestra',
  };

  /** Nombre de la calidad (1-5). */
  qualityLabel(q: number): string {
    return this.QUALITY_LABELS[q] ?? 'Normal';
  }

  /** Color identificativo de una ciudad (punto junto al nombre). */
  cityColor(city: string): string {
    return CITY_COLORS[city] ?? 'var(--text-dim)';
  }

  /** Clase de frescura según antigüedad del dato: reciente / medio / viejo. */
  freshness(iso: string): 'fresh' | 'mid' | 'old' {
    const min = (Date.now() - new Date(iso + 'Z').getTime()) / 60000;
    if (min <= 60) return 'fresh';
    if (min <= 6 * 60) return 'mid';
    return 'old';
  }

  /** "hace X min" a partir de una fecha ISO (UTC). */
  ago(iso: string): string {
    const diffMs = Date.now() - new Date(iso + 'Z').getTime();
    const min = Math.max(0, Math.round(diffMs / 60000));
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  }
}
