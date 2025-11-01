import { query } from '../utils/database';

export interface SpendingSummary {
  totalSpent: number;
  numberOfPurchases: number;
  averageTicket: number;
  comparedToLastPeriod: {
    spentChange: string;
    purchasesChange: string;
  } | null;
}

export interface TopProduct {
  productId: string;
  productName: string;
  purchaseCount: number;
  totalQuantity: number;
  totalSpent: number;
  avgPrice: number;
}

export interface SpendingTrend {
  date: string;
  totalSpent: number;
  purchaseCount: number;
  avgTicket: number;
}

export interface PriceFluctuation {
  productId: string;
  productName: string;
  currentPrice: number | null;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceHistory: Array<{
    date: Date;
    price: number;
    storeName: string | null;
    storeCnpj: string;
  }>;
}

export interface StoreComparison {
  storeCnpj: string;
  storeName: string | null;
  totalPurchases: number;
  totalSpent: number;
  avgTicket: number;
  productCount: number;
}

/**
 * Get spending summary for a period
 */
export const getSpendingSummary = async (
  userId: string,
  period: 'day' | 'week' | 'month' | 'year'
): Promise<SpendingSummary> => {
  // Determine date range based on period
  const periodMap: Record<string, string> = {
    day: '1 day',
    week: '7 days',
    month: '1 month',
    year: '1 year',
  };

  const interval = periodMap[period];

  // Current period stats
  const currentResult = await query(
    `SELECT
       COALESCE(SUM(total_amount), 0) as total,
       COUNT(*) as purchases,
       COALESCE(AVG(total_amount), 0) as average
     FROM receipts
     WHERE user_id = $1
       AND purchase_date >= CURRENT_DATE - INTERVAL '` + interval + `'
       AND purchase_date <= CURRENT_DATE`,
    [userId]
  );

  // Previous period stats (for comparison)
  const previousResult = await query(
    `SELECT
       COALESCE(SUM(total_amount), 0) as total,
       COUNT(*) as purchases
     FROM receipts
     WHERE user_id = $1
       AND purchase_date >= CURRENT_DATE - INTERVAL '` + interval + `' - INTERVAL '` + interval + `'
       AND purchase_date < CURRENT_DATE - INTERVAL '` + interval + `'`,
    [userId]
  );

  const current = currentResult.rows[0];
  const previous = previousResult.rows[0];

  // Calculate percentage changes
  let spentChange = '0%';
  let purchasesChange = '0';

  if (parseFloat(previous.total) > 0) {
    const spentDiff =
      ((parseFloat(current.total) - parseFloat(previous.total)) / parseFloat(previous.total)) * 100;
    spentChange = (spentDiff > 0 ? '+' : '') + spentDiff.toFixed(1) + '%';
  }

  const purchasesDiff = parseInt(current.purchases) - parseInt(previous.purchases);
  purchasesChange = (purchasesDiff > 0 ? '+' : '') + purchasesDiff;

  return {
    totalSpent: parseFloat(current.total),
    numberOfPurchases: parseInt(current.purchases),
    averageTicket: parseFloat(current.average),
    comparedToLastPeriod: {
      spentChange,
      purchasesChange,
    },
  };
};

/**
 * Get top products by purchase count
 */
export const getTopProducts = async (
  userId: string,
  limit: number = 10,
  period: 'week' | 'month' | 'year' | 'all' = 'all'
): Promise<TopProduct[]> => {
  // Build date filter
  let dateFilter = '';
  if (period !== 'all') {
    const intervalMap: Record<string, string> = {
      week: '7 days',
      month: '1 month',
      year: '1 year',
    };
    dateFilter = `AND r.purchase_date >= CURRENT_DATE - INTERVAL '` + intervalMap[period] + `'`;
  }

  const result = await query(
    `SELECT
       p.id as product_id,
       p.name as product_name,
       COUNT(ri.id) as purchase_count,
       SUM(ri.quantity) as total_quantity,
       SUM(ri.total_price) as total_spent,
       AVG(ri.unit_price) as avg_price
     FROM products p
     JOIN receipt_items ri ON p.id = ri.product_id
     JOIN receipts r ON ri.receipt_id = r.id
     WHERE r.user_id = $1 ` + dateFilter + `
     GROUP BY p.id, p.name
     ORDER BY purchase_count DESC, total_quantity DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    purchaseCount: parseInt(row.purchase_count),
    totalQuantity: parseFloat(row.total_quantity),
    totalSpent: parseFloat(row.total_spent),
    avgPrice: parseFloat(row.avg_price),
  }));
};

/**
 * Get spending trend over time
 */
export const getSpendingTrend = async (
  userId: string,
  days: number = 30,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<SpendingTrend[]> => {
  // Determine date truncation
  const truncMap: Record<string, string> = {
    day: 'day',
    week: 'week',
    month: 'month',
  };

  const trunc = truncMap[groupBy];

  const result = await query(
    `SELECT
       DATE_TRUNC('` + trunc + `', purchase_date) as date,
       SUM(total_amount) as total_spent,
       COUNT(*) as purchase_count,
       AVG(total_amount) as avg_ticket
     FROM receipts
     WHERE user_id = $1
       AND purchase_date >= CURRENT_DATE - INTERVAL '` + days + ` days'
       AND purchase_date <= CURRENT_DATE
     GROUP BY DATE_TRUNC('` + trunc + `', purchase_date)
     ORDER BY date ASC`,
    [userId]
  );

  return result.rows.map((row) => ({
    date: row.date,
    totalSpent: parseFloat(row.total_spent),
    purchaseCount: parseInt(row.purchase_count),
    avgTicket: parseFloat(row.avg_ticket),
  }));
};

/**
 * Get price fluctuation for a product
 */
export const getPriceFluctuation = async (
  userId: string,
  productId: string
): Promise<PriceFluctuation | null> => {
  // Get product info
  const productResult = await query(
    `SELECT id, name FROM products WHERE id = $1`,
    [productId]
  );

  if (productResult.rows.length === 0) {
    return null;
  }

  const product = productResult.rows[0];

  // Get price statistics (only from user's receipts)
  const statsResult = await query(
    `SELECT
       MIN(ri.unit_price) as lowest_price,
       MAX(ri.unit_price) as highest_price,
       AVG(ri.unit_price) as average_price
     FROM receipt_items ri
     JOIN receipts r ON ri.receipt_id = r.id
     WHERE ri.product_id = $1 AND r.user_id = $2`,
    [productId, userId]
  );

  const stats = statsResult.rows[0];

  if (!stats.lowest_price) {
    // User hasn't purchased this product
    return {
      productId,
      productName: product.name,
      currentPrice: null,
      lowestPrice: 0,
      highestPrice: 0,
      averagePrice: 0,
      priceHistory: [],
    };
  }

  // Get price history (last 30 records)
  const historyResult = await query(
    `SELECT
       r.purchase_date as date,
       ri.unit_price as price,
       r.store_name,
       r.store_cnpj
     FROM receipt_items ri
     JOIN receipts r ON ri.receipt_id = r.id
     WHERE ri.product_id = $1 AND r.user_id = $2
     ORDER BY r.purchase_date DESC
     LIMIT 30`,
    [productId, userId]
  );

  // Get most recent price
  const currentPrice = historyResult.rows.length > 0 ? historyResult.rows[0].price : null;

  return {
    productId,
    productName: product.name,
    currentPrice: currentPrice ? parseFloat(currentPrice) : null,
    lowestPrice: parseFloat(stats.lowest_price),
    highestPrice: parseFloat(stats.highest_price),
    averagePrice: parseFloat(stats.average_price),
    priceHistory: historyResult.rows.map((row) => ({
      date: row.date,
      price: parseFloat(row.price),
      storeName: row.store_name,
      storeCnpj: row.store_cnpj,
    })),
  };
};

/**
 * Compare stores by spending
 */
export const compareStores = async (
  userId: string,
  limit: number = 10,
  productId?: string
): Promise<StoreComparison[]> => {
  let productFilter = '';
  let params: any[] = [userId, limit];

  if (productId) {
    productFilter = `AND EXISTS (
      SELECT 1 FROM receipt_items ri
      WHERE ri.receipt_id = r.id AND ri.product_id = $3
    )`;
    params.push(productId);
  }

  const result = await query(
    `SELECT
       r.store_cnpj,
       r.store_name,
       COUNT(DISTINCT r.id) as total_purchases,
       SUM(r.total_amount) as total_spent,
       AVG(r.total_amount) as avg_ticket,
       COUNT(DISTINCT ri.product_id) as product_count
     FROM receipts r
     LEFT JOIN receipt_items ri ON r.id = ri.receipt_id
     WHERE r.user_id = $1
       AND r.store_cnpj IS NOT NULL
       ` + productFilter + `
     GROUP BY r.store_cnpj, r.store_name
     ORDER BY total_spent DESC
     LIMIT $2`,
    params
  );

  return result.rows.map((row) => ({
    storeCnpj: row.store_cnpj,
    storeName: row.store_name,
    totalPurchases: parseInt(row.total_purchases),
    totalSpent: parseFloat(row.total_spent),
    avgTicket: parseFloat(row.avg_ticket),
    productCount: parseInt(row.product_count),
  }));
};
