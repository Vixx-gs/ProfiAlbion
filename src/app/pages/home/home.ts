import { Component, HostListener, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MarketFlipsService, MarketFlip } from '../../core/market-flips.service';

@Component({
  selector: 'app-home',
  imports: [DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly flipsService = inject(MarketFlipsService);

  readonly flips = signal<MarketFlip[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
    this.flipsService.getTopFlips(8).subscribe({
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
