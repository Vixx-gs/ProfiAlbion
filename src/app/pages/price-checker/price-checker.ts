import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AlbionDataService, PriceEntry } from '../../core/albion-data.service';
import { ALL_ITEMS, ENCHANTS, displayName } from '../../core/items.catalog';

/** Opción del buscador: una variante de item (con tier y encantamiento). */
interface ItemOption {
  /** Id completo (con encantamiento), p.ej. "T6_MAIN_DAGGER@2". */
  id: string;
  /** Nombre mostrado, p.ej. "Daga del maestro (T6.2)". */
  name: string;
}

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
  private readonly qualityLabels: Record<number, string> = {
    1: 'Normal',
    2: 'Bueno',
    3: 'Notable',
    4: 'Sobresaliente',
    5: 'Obra maestra',
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
  readonly prices = signal<PriceEntry[]>([]);
  readonly loadingPrices = signal(false);
  readonly priceError = signal<string | null>(null);
  private pricesSub?: import('rxjs').Subscription;

  /** Filas de precio agrupadas por ciudad y calidad, ya ordenadas. */
  readonly priceRows = computed(() => {
    const rows = this.prices().filter((e) => !!e.sell_price_min);
    return [...rows].sort((a, b) => {
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

  /** Marca un item como consultado y carga su precio actual. */
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
    this.pricesSub = this.api.getPrices([opt.id], this.cities, [1, 2, 3, 4, 5]).subscribe({
      next: (entries) => {
        this.prices.set(entries);
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
    return `https://render.albiononline.com/v1/item/${id}.png?size=64`;
  }
  qualityLabel(q: number): string {
    return this.qualityLabels[q] ?? 'Normal';
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
