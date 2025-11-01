export interface SpendingSummary {
  totalSpent: number;
  numberOfPurchases: number;
  averageTicket: number;
  comparedToLastPeriod: {
    spentChange: string;
    purchasesChange: string;
  } | null;
}

export interface SpendingTrendItem {
  date: string;
  totalSpent: number;
  purchaseCount: number;
  avgTicket: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  purchaseCount: number;
  totalQuantity: number;
  totalSpent: number;
  avgPrice: number;
}
