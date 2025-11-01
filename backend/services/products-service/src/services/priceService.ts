import { query } from '../utils/database';

export interface PriceHistory {
  id: string;
  product_id: string;
  store_cnpj: string;
  price: number;
  recorded_at: Date;
}

export interface PriceComparison {
  storeCnpj: string;
  storeName: string | null;
  currentPrice: number;
  lastUpdated: Date;
  priceCount: number;
}

/**
 * Get price history for a product
 */
export const getPriceHistory = async (
  productId: string,
  options: {
    limit?: number;
    storeCnpj?: string;
  }
): Promise<PriceHistory[]> => {
  const { limit = 30, storeCnpj } = options;

  let whereClause = 'WHERE product_id = $1';
  let params: any[] = [productId];

  if (storeCnpj) {
    whereClause += ' AND store_cnpj = $2';
    params.push(storeCnpj);
  }

  const result = await query(
    `SELECT * FROM price_history
     ${whereClause}
     ORDER BY recorded_at DESC
     LIMIT $${params.length + 1}`,
    [...params, limit]
  );

  return result.rows;
};

/**
 * Get latest price for product at specific store
 */
export const getLatestPrice = async (
  productId: string,
  storeCnpj: string
): Promise<number | null> => {
  const result = await query(
    `SELECT price FROM price_history
     WHERE product_id = $1 AND store_cnpj = $2
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [productId, storeCnpj]
  );

  return result.rows[0]?.price || null;
};

/**
 * Compare prices across stores
 */
export const comparePrices = async (productId: string): Promise<PriceComparison[]> => {
  const result = await query(
    `SELECT
       ph.store_cnpj,
       r.store_name,
       ph.price as current_price,
       ph.recorded_at as last_updated,
       COUNT(*) OVER (PARTITION BY ph.store_cnpj) as price_count
     FROM (
       SELECT DISTINCT ON (store_cnpj)
         product_id,
         store_cnpj,
         price,
         recorded_at
       FROM price_history
       WHERE product_id = $1
       ORDER BY store_cnpj, recorded_at DESC
     ) ph
     LEFT JOIN LATERAL (
       SELECT store_name
       FROM receipts
       WHERE store_cnpj = ph.store_cnpj
       LIMIT 1
     ) r ON true
     ORDER BY ph.price ASC`,
    [productId]
  );

  return result.rows.map((row) => ({
    storeCnpj: row.store_cnpj,
    storeName: row.store_name,
    currentPrice: parseFloat(row.current_price),
    lastUpdated: row.last_updated,
    priceCount: parseInt(row.price_count),
  }));
};

/**
 * Get price statistics for a product
 */
export const getPriceStats = async (
  productId: string
): Promise<{
  currentAverage: number;
  lowestPrice: number;
  highestPrice: number;
  priceVariation: number;
  storeCount: number;
} | null> => {
  const result = await query(
    `SELECT
       AVG(price) as current_average,
       MIN(price) as lowest_price,
       MAX(price) as highest_price,
       (MAX(price) - MIN(price)) / NULLIF(MIN(price), 0) * 100 as price_variation,
       COUNT(DISTINCT store_cnpj) as store_count
     FROM (
       SELECT DISTINCT ON (store_cnpj)
         store_cnpj,
         price
       FROM price_history
       WHERE product_id = $1
       ORDER BY store_cnpj, recorded_at DESC
     ) latest_prices`,
    [productId]
  );

  const row = result.rows[0];

  if (!row || !row.current_average) {
    return null;
  }

  return {
    currentAverage: parseFloat(row.current_average),
    lowestPrice: parseFloat(row.lowest_price),
    highestPrice: parseFloat(row.highest_price),
    priceVariation: parseFloat(row.price_variation || '0'),
    storeCount: parseInt(row.store_count),
  };
};

/**
 * Get price trend (last 30 days)
 */
export const getPriceTrend = async (
  productId: string,
  days: number = 30
): Promise<
  Array<{
    date: string;
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    recordCount: number;
  }>
> => {
  const result = await query(
    `SELECT
       DATE(recorded_at) as date,
       AVG(price) as average_price,
       MIN(price) as min_price,
       MAX(price) as max_price,
       COUNT(*) as record_count
     FROM price_history
     WHERE product_id = $1
       AND recorded_at >= CURRENT_DATE - INTERVAL '${days} days'
     GROUP BY DATE(recorded_at)
     ORDER BY date ASC`,
    [productId]
  );

  return result.rows.map((row) => ({
    date: row.date,
    averagePrice: parseFloat(row.average_price),
    minPrice: parseFloat(row.min_price),
    maxPrice: parseFloat(row.max_price),
    recordCount: parseInt(row.record_count),
  }));
};

/**
 * Register new price
 */
export const registerPrice = async (
  productId: string,
  storeCnpj: string,
  price: number
): Promise<PriceHistory> => {
  const result = await query(
    `INSERT INTO price_history (product_id, store_cnpj, price)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [productId, storeCnpj, price]
  );

  return result.rows[0];
};

/**
 * Find best price for product
 */
export const findBestPrice = async (
  productId: string
): Promise<{
  storeCnpj: string;
  storeName: string | null;
  price: number;
  recordedAt: Date;
} | null> => {
  const result = await query(
    `SELECT
       ph.store_cnpj,
       r.store_name,
       ph.price,
       ph.recorded_at
     FROM (
       SELECT DISTINCT ON (store_cnpj)
         store_cnpj,
         price,
         recorded_at
       FROM price_history
       WHERE product_id = $1
       ORDER BY store_cnpj, recorded_at DESC
     ) ph
     LEFT JOIN LATERAL (
       SELECT store_name
       FROM receipts
       WHERE store_cnpj = ph.store_cnpj
       LIMIT 1
     ) r ON true
     ORDER BY ph.price ASC
     LIMIT 1`,
    [productId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    storeCnpj: row.store_cnpj,
    storeName: row.store_name,
    price: parseFloat(row.price),
    recordedAt: row.recorded_at,
  };
};
