import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, timeout, catchError } from 'rxjs';
import { AlbionDataService, PriceEntry } from './albion-data.service';
import { ITEM_CATALOG, displayName } from './items.catalog';

/** Una oportunidad de flip: comprar barato en una ciudad y vender caro en otra. */
export interface MarketFlip {
  itemId: string;
  name: string;
  /** Calidad del item (1-5). */
  quality: number;
  buyCity: string;
  buyPrice: number;
  sellCity: string;
  sellPrice: number;
  /** Orden de compra más alta del Black Market: precio de compra instantánea. */
  sellBuyMax: number;
  profit: number;
  marginPct: number;
  /** Fecha del dato más antiguo usado (para "última actualización"). */
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class MarketFlipsService {
  private readonly api = inject(AlbionDataService);

  /** Tarifa de impuesto del mercado al vender (orden de venta). */
  private readonly SELL_TAX = 0.065;

  /** Máximo de antigüedad aceptado por dato (horas). Más viejo se descarta. */
  private readonly MAX_AGE_HOURS = 24;

  /** Timeout por petición (ms): si un lote tarda más, se ignora. */
  private readonly REQUEST_TIMEOUT = 20_000;

  /**
   * Escanea el catálogo y devuelve los mejores flips ordenados por beneficio.
   * Estrategia: comprar al `sell_price_min` más bajo y vender al `sell_price_min`
   * más alto entre ciudades (descontando impuesto de mercado).
   */
  getTopFlips(limit = 10): Observable<MarketFlip[]> {
    const ids = ITEM_CATALOG.map((i) => i.id);
    // Dividir en lotes para no exceder la longitud máxima de URL de la API.
    const CHUNK = 40;
    const batches: Observable<PriceEntry[]>[] = [];
    for (let i = 0; i < ids.length; i += CHUNK) {
      const slice = ids.slice(i, i + CHUNK);
      batches.push(
        this.api.getPrices(slice, AlbionDataService.CITIES, [1, 2, 3, 4, 5]).pipe(
          timeout(this.REQUEST_TIMEOUT),
          // Si un lote falla o tarda demasiado, devolvemos vacío para no bloquear el resto.
          catchError(() => of([] as PriceEntry[])),
        ),
      );
    }
    return forkJoin(batches).pipe(
      map((results) => results.flat()),
      map((entries) => this.computeFlips(entries)),
      map((flips) => flips.slice(0, limit)),
    );
  }

  private computeFlips(entries: PriceEntry[]): MarketFlip[] {
    const maxAgeMs = this.MAX_AGE_HOURS * 3600_000;
    const isFresh = (iso: string): boolean =>
      !!iso && Date.now() - new Date(iso + 'Z').getTime() <= maxAgeMs;

    // Agrupar por item + calidad (no mezclar calidades distintas en un flip).
    const byItem = new Map<string, PriceEntry[]>();
    for (const e of entries) {
      if (!e.sell_price_min) continue; // descartar sin datos
      if (!isFresh(e.sell_price_min_date)) continue; // descartar datos viejos
      const key = `${e.item_id}|${e.quality}`;
      const list = byItem.get(key) ?? [];
      list.push(e);
      byItem.set(key, list);
    }

    const flips: MarketFlip[] = [];
    for (const [key, list] of byItem) {
      const itemId = key.split('|')[0];
      // Vender SOLO en el Black Market (orden de venta).
      const black = list.find((e) => e.city === 'Black Market');
      if (!black) continue;

      // Comprar en la ciudad normal más barata (excluyendo el Black Market).
      const cities = list.filter((e) => e.city !== 'Black Market');
      if (!cities.length) continue;
      const cheapest = cities.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));

      const buyPrice = cheapest.sell_price_min;
      const grossSell = black.sell_price_min;
      const netSell = Math.round(grossSell * (1 - this.SELL_TAX));
      const profit = netSell - buyPrice;
      if (profit <= 0) continue;

      flips.push({
        itemId,
        name: displayName(itemId),
        quality: black.quality,
        buyCity: cheapest.city,
        buyPrice,
        sellCity: black.city,
        sellPrice: grossSell,
        sellBuyMax: black.buy_price_max,
        profit,
        marginPct: +((profit / buyPrice) * 100).toFixed(2),
        updatedAt: this.oldest(cheapest.sell_price_min_date, black.sell_price_min_date),
      });
    }

    // Primero los más recientes y, a igualdad de frescura, los de mayor plata.
    const tier = (iso: string): number => {
      const min = (Date.now() - new Date(iso + 'Z').getTime()) / 60000;
      if (min <= 60) return 0;
      if (min <= 6 * 60) return 1;
      return 2;
    };
    return flips.sort((a, b) => {
      const t = tier(a.updatedAt) - tier(b.updatedAt);
      return t !== 0 ? t : b.profit - a.profit;
    });
  }

  private oldest(a: string, b: string): string {
    return new Date(a) < new Date(b) ? a : b;
  }
}
