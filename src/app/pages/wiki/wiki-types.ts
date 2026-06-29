export interface DropEntry {
  itemId: string;
  label: string;
  /** Sin premium (ej: "0", "3-6") */
  noPremium?: string;
  /** Con premium (ej: "2", "6-14") */
  withPremium?: string;
  /** Cantidad fija (ej: "1") */
  quantity?: string;
  /** Probabilidad de drop (ej: "10%", "100%") */
  percentage: string;
  /** Ruta de enlace opcional */
  link?: string;
}

export interface UsageInfo {
  seedImageItemId: string;
  description: string;
  points: string[];
}

export interface CraftableItem {
  itemId: string;
  name: string;
}

export interface ItemData {
  folder: string;
  harvestId: string;
  seedId: string;
  name: string;
  tier: number;
  /** Tiempo de crecimiento en horas */
  growHours?: number;
  /** Bono diario de riego (foco) – multiplicador de semillas devueltas (ej: 2.0 = +200 %) */
  focusBonus?: number;
  /** Coste diario de riego en unidades de foco */
  focusCost?: number;
  /** Producción de semilla – fracción de semilla devuelta por cosecha (ej: 0.3333 = 33.33 %) */
  seedsPerHarvest?: number;
  /** Precio base del mercader agrícola */
  defaultSeedPrice?: number;
  /** Rendimiento del producto por parcela */
  yieldPerHarvest?: number;
  /** Puntos de información adicional (cada string es un <li>) */
  moreInfo?: string[];
  /** Posibilidades de drop al cosechar */
  drops?: DropEntry[];
  /** Información de uso del cultivo */
  usageInfo?: UsageInfo;
  /** Items crafteables a partir del cultivo */
  craftableItems?: CraftableItem[];
}
