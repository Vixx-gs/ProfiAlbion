import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Precio de un item en una ubicación, tal cual lo devuelve AODP. */
export interface PriceEntry {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number;
  sell_price_min_date: string;
  sell_price_max: number;
  buy_price_max: number;
  buy_price_max_date: string;
}

/** Precio del oro en el tiempo. */
export interface GoldPrice {
  price: number;
  timestamp: string;
}

/**
 * Cliente del Albion Online Data Project (AODP).
 * Por ahora fijo al servidor de Europa.
 * Docs: https://www.albion-online-data.com/api/
 */
@Injectable({ providedIn: 'root' })
export class AlbionDataService {
  private readonly http = inject(HttpClient);

  /** Base de la API para el servidor de Europa. */
  private readonly base = 'https://europe.albion-online-data.com/api/v2/stats';

  /** Ciudades del mercado en el servidor de Europa + Black Market. */
  static readonly CITIES = [
    'Caerleon',
    'Bridgewatch',
    'Martlock',
    'Thetford',
    'Lymhurst',
    'Fort Sterling',
    'Brecilien',
    'Black Market',
  ];

  /**
   * Precios actuales de uno o varios items.
   * @param itemIds  ej. ['T4_BAG', 'T5_BAG']
   * @param locations ciudades; por defecto todas
   * @param qualities calidades (1-5); por defecto todas
   */
  getPrices(
    itemIds: string[],
    locations: string[] = AlbionDataService.CITIES,
    qualities: number[] = [],
  ): Observable<PriceEntry[]> {
    const ids = itemIds.map((i) => encodeURIComponent(i)).join(',');
    const params: string[] = [];
    if (locations.length) {
      params.push('locations=' + locations.map((l) => encodeURIComponent(l)).join(','));
    }
    if (qualities.length) {
      params.push('qualities=' + qualities.join(','));
    }
    const query = params.length ? '?' + params.join('&') : '';
    return this.http.get<PriceEntry[]>(`${this.base}/prices/${ids}.json${query}`);
  }

  /** Precio del oro: últimas `count` entradas. */
  getGold(count = 24): Observable<GoldPrice[]> {
    return this.http.get<GoldPrice[]>(`${this.base}/gold.json?count=${count}`);
  }
}
