import { Injectable, inject } from '@angular/core';
import { Observable, from, map, mergeMap, of, scan, timeout, catchError } from 'rxjs';
import { AlbionDataService, HistoryEntry, PriceEntry } from './albion-data.service';
import { ITEM_CATALOG, ITEM_BY_ID, ENCHANTS, displayName } from './items.catalog';

/** Una oportunidad de flip: comprar en una ciudad normal y vender en el Black Market. */
export interface MarketFlip {
  /** Id completo (con encantamiento) del item que se vende. */
  itemId: string;
  name: string;
  /** Tier del item (4-8). */
  tier: number;
  /** Calidad del item (1-5). */
  quality: number;
  buyCity: string;
  buyPrice: number;
  sellCity: string;
  sellPrice: number;
  /** Orden de compra más alta en el destino: precio de compra instantánea. */
  sellBuyMax: number;
  profit: number;
  marginPct: number;
  /** Fecha del dato más antiguo usado (para "última actualización"). */
  updatedAt: string;
  /** Unidades vendidas en el Black Market en las últimas 24h (flujo de venta). */
  volume24h: number;
}

/** Parámetros del escaneo (panel "Fetch Flips"). */
export interface ScanParams {
  qualities: number[];
  tiers: number[];
}

/** Resultado de un escaneo completo. */
export interface FlipResult {
  flips: MarketFlip[];
  /** Combinaciones analizadas (directas + rutas de encantamiento). */
  analysed: number;
  /** Momento (ms) en que se obtuvieron los datos. */
  fetchedAt: number;
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
  /** Lotes en paralelo (= límite de conexiones del navegador por host). */
  private readonly CONCURRENCY = 6;
  /** Máximo de filas devueltas. */
  private readonly MAX_RESULTS = 1000;

  // ===== Home: top de chollos del Black Market (compatibilidad) =====

  /**
   * Escanea el catálogo y devuelve los mejores flips directos vendiendo en el
   * Black Market, ordenados por frescura y beneficio. Usado por la home.
   */
  getTopFlips(limit = 10): Observable<MarketFlip[]> {
    const ids = this.expandItemIds(ITEM_CATALOG.map((i) => i.id));
    // streamPrices emite tras cada lote, así la home muestra filas según llegan.
    return this.streamPrices(ids, AlbionDataService.CITIES, [1, 2, 3, 4, 5]).pipe(
      map((entries) => this.computeBlackMarketFlips(entries).slice(0, limit)),
    );
  }

  // ===== Vista de flipping: escaneo parametrizado =====

  /** Escanea según parámetros y devuelve los flips directos encontrados. */
  getFlips(params: ScanParams): Observable<FlipResult> {
    const bases = ITEM_CATALOG.filter((i) => params.tiers.includes(i.tier));
    const itemIds = this.expandItemIds(bases.map((i) => i.id));
    const locations = AlbionDataService.CITIES;

    const CHUNK = 40;
    type Req = { kind: 'price' | 'volume'; ids: string[] };
    const reqs: Req[] = [];
    // Precio y flujo de venta del MISMO lote de items intercalados: mergeMap
    // respeta el orden de llegada, así que si fueran todos los de precio
    // primero, el flujo de venta no empezaría a llegar hasta acabar el
    // escaneo entero de precios (con miles de items, tardaría minutos).
    for (let i = 0; i < itemIds.length; i += CHUNK) {
      const ids = itemIds.slice(i, i + CHUNK);
      reqs.push({ kind: 'price', ids });
      reqs.push({ kind: 'volume', ids });
    }

    interface Acc {
      prices: PriceEntry[];
      history: HistoryEntry[];
    }

    // Un único flujo con tope de concurrencia (precios + flujo de venta
    // comparten el mismo cupo, para no exceder el límite de conexiones del
    // navegador). Se emite un resultado parcial tras CADA lote.
    return from(reqs).pipe(
      mergeMap((req) => {
        const obs: Observable<{ kind: 'price' | 'volume'; data: PriceEntry[] | HistoryEntry[] }> =
          req.kind === 'price'
            ? this.api
                .getPrices(req.ids, locations, params.qualities)
                .pipe(map((data) => ({ kind: 'price' as const, data })))
            : this.api
                .getHistory(req.ids, ['Black Market'], params.qualities, 24)
                .pipe(map((data) => ({ kind: 'volume' as const, data })));
        return obs.pipe(
          timeout(this.REQUEST_TIMEOUT),
          catchError(() => of({ kind: req.kind, data: [] as (PriceEntry | HistoryEntry)[] })),
        );
      }, this.CONCURRENCY),
      scan(
        (acc, res): Acc =>
          res.kind === 'price'
            ? { prices: acc.prices.concat(res.data as PriceEntry[]), history: acc.history }
            : { prices: acc.prices, history: acc.history.concat(res.data as HistoryEntry[]) },
        { prices: [], history: [] } as Acc,
      ),
      map((acc) => this.buildResult(acc.prices, acc.history, params)),
    );
  }

  // ===== Internos =====

  /** Genera los ids con encantamiento (.0 a .3) de una lista de ids base. */
  private expandItemIds(baseIds: string[]): string[] {
    const out: string[] = [];
    for (const id of baseIds) {
      for (const e of ENCHANTS) out.push(e === 0 ? id : `${id}@${e}`);
    }
    return out;
  }

  /**
   * Pide precios en lotes (concurrencia limitada) y emite los precios acumulados
   * tras CADA lote, para mostrar resultados parciales mientras se escanea.
   * La concurrencia limitada hace además que el timeout de cada lote empiece al
   * arrancar la petición —no al suscribirse— evitando abortos por cola.
   */
  private streamPrices(
    ids: string[],
    locations: string[],
    qualities: number[],
    seed: PriceEntry[] = [],
  ): Observable<PriceEntry[]> {
    const CHUNK = 40;
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += CHUNK) {
      chunks.push(ids.slice(i, i + CHUNK));
    }
    return from(chunks).pipe(
      mergeMap(
        (slice) =>
          this.api.getPrices(slice, locations, qualities).pipe(
            timeout(this.REQUEST_TIMEOUT),
            catchError(() => of([] as PriceEntry[])),
          ),
        this.CONCURRENCY,
      ),
      scan((acc, batch) => acc.concat(batch), [...seed]),
    );
  }

  private isFresh(iso: string): boolean {
    const maxAgeMs = this.MAX_AGE_HOURS * 3600_000;
    return !!iso && Date.now() - new Date(iso + 'Z').getTime() <= maxAgeMs;
  }

  private netSell(gross: number): number {
    return Math.round(gross * (1 - this.SELL_TAX));
  }

  private oldest(a: string, b: string): string {
    return new Date(a) < new Date(b) ? a : b;
  }

  /** Indexa entradas frescas por item_id. */
  private indexFresh(entries: PriceEntry[], locations: string[]): Map<string, PriceEntry[]> {
    const allowed = new Set(locations);
    const byId = new Map<string, PriceEntry[]>();
    for (const e of entries) {
      if (!e.sell_price_min) continue;
      if (!this.isFresh(e.sell_price_min_date)) continue;
      if (!allowed.has(e.city)) continue;
      const list = byId.get(e.item_id) ?? [];
      list.push(e);
      byId.set(e.item_id, list);
    }
    return byId;
  }

  /** Unidades vendidas en las últimas 24h por item_id+calidad (histórico diario). */
  private indexVolume(entries: HistoryEntry[]): Map<string, number> {
    const byKey = new Map<string, number>();
    for (const h of entries) {
      const last = h.data[h.data.length - 1];
      if (!last) continue;
      byKey.set(`${h.item_id}|${h.quality}`, last.item_count);
    }
    return byKey;
  }

  /** Construye el resultado completo (flips directos). */
  private buildResult(entries: PriceEntry[], history: HistoryEntry[], params: ScanParams): FlipResult {
    const byId = this.indexFresh(entries, AlbionDataService.CITIES);
    const volumeByKey = this.indexVolume(history);
    const flips: MarketFlip[] = [];
    let analysed = 0;

    for (const item of ITEM_CATALOG) {
      if (!params.tiers.includes(item.tier)) continue;

      for (const q of params.qualities) {
        // --- Flip directo: comprar en cualquier ciudad y vender en Black Market ---
        for (const e of ENCHANTS) {
          const id = e === 0 ? item.id : `${item.id}@${e}`;
          flips.push(...this.directFlips(id, q, byId, item.tier, volumeByKey));
          if (byId.has(id)) analysed++;
        }
      }
    }

    flips.sort((a, b) => b.profit - a.profit);
    return {
      flips: flips.slice(0, this.MAX_RESULTS),
      analysed,
      fetchedAt: Date.now(),
    };
  }

  /**
   * Flips directos de un item+calidad concretos: comprar en una ciudad normal
   * y vender en el Black Market (nunca al revés). Devuelve una fila por CADA
   * ciudad de compra que dé beneficio, no solo la más barata.
   */
  private directFlips(
    id: string,
    quality: number,
    byId: Map<string, PriceEntry[]>,
    tier: number,
    volumeByKey: Map<string, number>,
  ): MarketFlip[] {
    const list = (byId.get(id) ?? []).filter((e) => e.quality === quality);
    const black = list.find((e) => e.city === 'Black Market');
    if (!black) return [];
    const volume24h = volumeByKey.get(`${id}|${quality}`) ?? 0;

    const out: MarketFlip[] = [];
    for (const buy of list) {
      if (buy.city === 'Black Market') continue;
      const profit = (black.buy_price_max || black.sell_price_min) - buy.sell_price_min;
      if (profit <= 0) continue;

      out.push({
        itemId: id,
        name: displayName(id),
        tier,
        quality,
        buyCity: buy.city,
        buyPrice: buy.sell_price_min,
        sellCity: black.city,
        sellPrice: black.sell_price_min,
        sellBuyMax: black.buy_price_max,
        profit,
        marginPct: +((profit / buy.sell_price_min) * 100).toFixed(2),
        updatedAt: this.oldest(buy.sell_price_min_date, black.sell_price_min_date),
        volume24h,
      });
    }
    return out;
  }

  // ===== Lógica heredada de la home (vender solo en Black Market) =====

  private computeBlackMarketFlips(entries: PriceEntry[]): MarketFlip[] {
    const byId = this.indexFresh(entries, AlbionDataService.CITIES);
    const flips: MarketFlip[] = [];

    for (const [id, list] of byId) {
      const base = ITEM_BY_ID.get(id.split('@')[0]);
      const tier = base?.tier ?? (Number(id.slice(1, 2)) || 0);

      const byQuality = new Map<number, PriceEntry[]>();
      for (const e of list) {
        const arr = byQuality.get(e.quality) ?? [];
        arr.push(e);
        byQuality.set(e.quality, arr);
      }

      for (const [quality, group] of byQuality) {
        const black = group.find((e) => e.city === 'Black Market');
        if (!black) continue;
        const cities = group.filter((e) => e.city !== 'Black Market');
        if (!cities.length) continue;
        const cheapest = cities.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));

        const buyPrice = cheapest.sell_price_min;
        const profit = (black.buy_price_max || black.sell_price_min) - buyPrice;
        if (profit <= 0) continue;

        flips.push({
          itemId: id,
          name: displayName(id),
          tier,
          quality,
          buyCity: cheapest.city,
          buyPrice,
          sellCity: black.city,
          sellPrice: black.sell_price_min,
          sellBuyMax: black.buy_price_max,
          profit,
          marginPct: +((profit / buyPrice) * 100).toFixed(2),
          updatedAt: this.oldest(cheapest.sell_price_min_date, black.sell_price_min_date),
          // La home no pide histórico de volumen (mantiene el escaneo ligero).
          volume24h: 0,
        });
      }
    }

    // Primero los más recientes; a igualdad de fecha, los de mayor beneficio.
    const time = (iso: string): number => new Date(iso + 'Z').getTime();
    return flips.sort((a, b) => {
      const t = time(b.updatedAt) - time(a.updatedAt);
      return t !== 0 ? t : b.profit - a.profit;
    });
  }
}
