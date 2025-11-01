export interface Product {
  id: string;
  name: string;
  normalizedName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryItem {
  id: string;
  productId: string;
  storeCnpj: string;
  storeName: string | null;
  price: number;
  recordedAt: string;
}

export interface PriceComparison {
  storeCnpj: string;
  storeName: string | null;
  currentPrice: number;
  lastRecorded: string;
}

export interface PriceStats {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  variationPercentage: number;
}
