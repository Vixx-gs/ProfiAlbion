import { Injectable, inject } from '@angular/core';
import { Observable, from, map, mergeMap, of, scan, timeout, catchError } from 'rxjs';
import { AlbionDataService, PriceEntry } from './albion-data.service';
import {
  ITEM_CATALOG,
  ITEM_BY_ID,
  ENCHANTS,
  displayName,
} from './items.catalog';
import { enchantMaterialId, enchantMaterialIds, enchantQty } from './enchant';

/** Tipo de flip: directo (mismo item) o por encantamiento (comprar base y subir). */
export type FlipType = 'direct' | 'upgrade';

/** Una oportunidad de flip. */
export interface MarketFlip {
  /** Id completo (con encantamiento) del item que se vende. */
  itemId: string;
  name: string;
  /** Tier del item (4-8). */
  tier: number;
  /** Calidad del item (1-5). */
  quality: number;
  type: FlipType;
  buyCity: string;
  /** Para 'upgrade' es el coste total (item base + materiales de encantamiento). */
  buyPrice: number;
  sellCity: string;
  sellPrice: number;
  /** Orden de compra más alta en el destino: precio de compra instantánea. */
  sellBuyMax: number;
  profit: number;
  marginPct: number;
  /** Fecha del dato más antiguo usado (para "última actualización"). */
  updatedAt: string;
  /** Solo 'upgrade': nivel de encantamiento del item base que se compra. */
  upgradeFromEnchant?: number;
  /** Solo 'upgrade': número de pasos de encantamiento aplicados. */
  upgradeSteps?: number;
}

/** Parámetros del escaneo (panel "Fetch Flips"). */
export interface ScanParams {
  scanTypes: FlipType[];
  locations: string[];
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

  /** Escanea según parámetros y devuelve flips directos y/o de encantamiento. */
  getFlips(params: ScanParams): Observable<FlipResult> {
    const bases = ITEM_CATALOG.filter((i) => params.tiers.includes(i.tier));
    const itemIds = this.expandItemIds(bases.map((i) => i.id));

    // Materiales de encantamiento (solo si se va a calcular 'upgrade').
    const matIds = params.scanTypes.includes('upgrade')
      ? params.tiers.flatMap((t) => enchantMaterialIds(t))
      : [];

    const CHUNK = 40;
    const reqs: { ids: string[]; qualities: number[] }[] = [];
    // Materiales primero (petición ligera, calidad 1): entran en los primeros
    // lotes para que los flips de encantamiento aparezcan pronto.
    for (let i = 0; i < matIds.length; i += CHUNK) {
      reqs.push({ ids: matIds.slice(i, i + CHUNK), qualities: [1] });
    }
    for (let i = 0; i < itemIds.length; i += CHUNK) {
      reqs.push({ ids: itemIds.slice(i, i + CHUNK), qualities: params.qualities });
    }

    // Un único flujo con tope de concurrencia: se acumulan los precios y se
    // emite un resultado parcial tras CADA lote, así la tabla aparece enseguida
    // y va creciendo en vez de esperar a que termine todo el escaneo.
    return from(reqs).pipe(
      mergeMap(
        (req) =>
          this.api.getPrices(req.ids, params.locations, req.qualities).pipe(
            timeout(this.REQUEST_TIMEOUT),
            catchError(() => of([] as PriceEntry[])),
          ),
        this.CONCURRENCY,
      ),
      scan((acc, batch) => acc.concat(batch), [] as PriceEntry[]),
      map((entries) => this.buildResult(entries, params)),
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

  /** Construye el resultado completo (directos + encantamiento). */
  private buildResult(entries: PriceEntry[], params: ScanParams): FlipResult {
    const byId = this.indexFresh(entries, params.locations);
    const flips: MarketFlip[] = [];
    let analysed = 0;

    const wantDirect = params.scanTypes.includes('direct');
    const wantUpgrade = params.scanTypes.includes('upgrade');
    const qualities = params.qualities;

    for (const item of ITEM_CATALOG) {
      if (!params.tiers.includes(item.tier)) continue;

      for (const q of qualities) {
        // --- Flip directo: comprar barato y vender caro entre ubicaciones ---
        if (wantDirect) {
          for (const e of ENCHANTS) {
            const id = e === 0 ? item.id : `${item.id}@${e}`;
            const direct = this.directFlip(id, q, byId, item.tier);
            if (direct) flips.push(direct);
            if (byId.has(id)) analysed++;
          }
        }

        // --- Flip por encantamiento: comprar base y subir a .L ---
        if (wantUpgrade) {
          for (let L = 1; L <= 3; L++) {
            const up = this.upgradeFlip(item, q, L, byId);
            if (up) flips.push(up);
            analysed++;
          }
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

  /** Mejor flip directo de un item+calidad concretos entre las ubicaciones. */
  private directFlip(
    id: string,
    quality: number,
    byId: Map<string, PriceEntry[]>,
    tier: number,
  ): MarketFlip | null {
    const list = (byId.get(id) ?? []).filter((e) => e.quality === quality);
    if (list.length < 2) return null;

    const cheapest = list.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));
    const dearest = list.reduce((a, b) => (a.sell_price_min > b.sell_price_min ? a : b));
    if (cheapest.city === dearest.city) return null;

    const buyPrice = cheapest.sell_price_min;
    const profit = this.netSell(dearest.sell_price_min) - buyPrice;
    if (profit <= 0) return null;

    return {
      itemId: id,
      name: displayName(id),
      tier,
      quality,
      type: 'direct',
      buyCity: cheapest.city,
      buyPrice,
      sellCity: dearest.city,
      sellPrice: dearest.sell_price_min,
      sellBuyMax: dearest.buy_price_max,
      profit,
      marginPct: +((profit / buyPrice) * 100).toFixed(2),
      updatedAt: this.oldest(cheapest.sell_price_min_date, dearest.sell_price_min_date),
    };
  }

  /**
   * Mejor flip por encantamiento de un item a nivel `L`: compra la versión más
   * barata entre .0 y .(L-1), suma el coste de los materiales para llegar a .L
   * y vende al precio más alto disponible.
   */
  private upgradeFlip(
    item: (typeof ITEM_CATALOG)[number],
    quality: number,
    L: number,
    byId: Map<string, PriceEntry[]>,
  ): MarketFlip | null {
    const targetId = `${item.id}@${L}`;
    const sellList = (byId.get(targetId) ?? []).filter((e) => e.quality === quality);
    if (!sellList.length) return null;
    const sell = sellList.reduce((a, b) => (a.sell_price_min > b.sell_price_min ? a : b));

    // Precio (compra instantánea) de cada material necesario, por nivel.
    const matPrice: Record<number, { price: number; date: string }> = {};
    for (let k = 1; k <= L; k++) {
      const matId = enchantMaterialId(item.tier, k);
      const mats = (byId.get(matId) ?? []).filter((e) => e.quality === 1);
      if (!mats.length) return null; // sin datos de material: no se puede calcular
      const m = mats.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));
      matPrice[k] = { price: m.sell_price_min, date: m.sell_price_min_date };
    }

    const qty = enchantQty(item.category);

    // Probar cada nivel de partida j (0..L-1) y quedarnos con el más barato.
    let best: { cost: number; buyCity: string; from: number; date: string } | null = null;
    for (let j = 0; j < L; j++) {
      const startId = j === 0 ? item.id : `${item.id}@${j}`;
      const buyList = (byId.get(startId) ?? []).filter((e) => e.quality === quality);
      if (!buyList.length) continue;
      const buy = buyList.reduce((a, b) => (a.sell_price_min < b.sell_price_min ? a : b));

      let cost = buy.sell_price_min;
      let date = buy.sell_price_min_date;
      for (let k = j + 1; k <= L; k++) {
        cost += matPrice[k].price * qty;
        date = this.oldest(date, matPrice[k].date);
      }
      if (!best || cost < best.cost) {
        best = { cost, buyCity: buy.city, from: j, date };
      }
    }
    if (!best) return null;

    const profit = this.netSell(sell.sell_price_min) - best.cost;
    if (profit <= 0) return null;

    return {
      itemId: targetId,
      name: displayName(targetId),
      tier: item.tier,
      quality,
      type: 'upgrade',
      buyCity: best.buyCity,
      buyPrice: best.cost,
      sellCity: sell.city,
      sellPrice: sell.sell_price_min,
      sellBuyMax: sell.buy_price_max,
      profit,
      marginPct: +((profit / best.cost) * 100).toFixed(2),
      updatedAt: this.oldest(best.date, sell.sell_price_min_date),
      upgradeFromEnchant: best.from,
      upgradeSteps: L - best.from,
    };
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
        const profit = this.netSell(black.sell_price_min) - buyPrice;
        if (profit <= 0) continue;

        flips.push({
          itemId: id,
          name: displayName(id),
          tier,
          quality,
          type: 'direct',
          buyCity: cheapest.city,
          buyPrice,
          sellCity: black.city,
          sellPrice: black.sell_price_min,
          sellBuyMax: black.buy_price_max,
          profit,
          marginPct: +((profit / buyPrice) * 100).toFixed(2),
          updatedAt: this.oldest(cheapest.sell_price_min_date, black.sell_price_min_date),
        });
      }
    }

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
}
