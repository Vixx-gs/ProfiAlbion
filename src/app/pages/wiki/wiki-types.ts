export interface ItemData {
  folder: string;
  harvestId: string;
  seedId: string;
  name: string;
  tier: number;
}

export interface AnimalItemData {
  folder: string;
  babyId: string;
  grownId: string;
  meatId: string;
  name: string;
  tier: number;
  hasProduct: boolean;
  productId?: string;
  feedCropId: string;
  feedQty: number;
  npcBabyPrice: number;
  growHours: number;
  offspringBase: number;
  offspringFocusBonus: number;
}
