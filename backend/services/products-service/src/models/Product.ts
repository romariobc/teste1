import { query } from '../utils/database';

export interface Product {
  id: string;
  name: string;
  normalized_name: string;
  category: string | null;
  unit: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  name: string;
  normalizedName: string;
  category?: string | null;
  unit?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  normalizedName?: string;
  category?: string | null;
  unit?: string | null;
}

/**
 * Create a new product
 */
export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  const result = await query(
    `INSERT INTO products (name, normalized_name, category, unit)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.name, input.normalizedName, input.category || null, input.unit || null]
  );

  return result.rows[0];
};

/**
 * Find product by ID
 */
export const findProductById = async (id: string): Promise<Product | null> => {
  const result = await query(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Find product by normalized name
 */
export const findProductByNormalizedName = async (
  normalizedName: string
): Promise<Product | null> => {
  const result = await query(
    `SELECT * FROM products WHERE normalized_name = $1`,
    [normalizedName]
  );

  return result.rows[0] || null;
};

/**
 * List products with pagination and filters
 */
export const listProducts = async (options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<{ products: Product[]; total: number }> => {
  const { page = 1, limit = 20, search, category } = options;
  const offset = (page - 1) * limit;

  // Build query with filters
  let whereConditions: string[] = [];
  let params: any[] = [];
  let paramCount = 1;

  if (search) {
    whereConditions.push(`(name ILIKE $${paramCount} OR normalized_name ILIKE $${paramCount})`);
    params.push(`%${search}%`);
    paramCount++;
  }

  if (category) {
    whereConditions.push(`category = $${paramCount}`);
    params.push(category);
    paramCount++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) FROM products ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get products
  const productsResult = await query(
    `SELECT * FROM products
     ${whereClause}
     ORDER BY name ASC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    [...params, limit, offset]
  );

  return {
    products: productsResult.rows,
    total,
  };
};

/**
 * Update product
 */
export const updateProduct = async (
  id: string,
  updates: UpdateProductInput
): Promise<Product | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramCount}`);
    values.push(updates.name);
    paramCount++;
  }

  if (updates.normalizedName !== undefined) {
    fields.push(`normalized_name = $${paramCount}`);
    values.push(updates.normalizedName);
    paramCount++;
  }

  if (updates.category !== undefined) {
    fields.push(`category = $${paramCount}`);
    values.push(updates.category);
    paramCount++;
  }

  if (updates.unit !== undefined) {
    fields.push(`unit = $${paramCount}`);
    values.push(updates.unit);
    paramCount++;
  }

  if (fields.length === 0) {
    return findProductById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE products
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  const result = await query(
    `DELETE FROM products WHERE id = $1`,
    [id]
  );

  return (result.rowCount || 0) > 0;
};

/**
 * Get product statistics
 */
export const getProductStats = async (
  productId: string
): Promise<{
  totalPurchases: number;
  totalQuantity: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
} | null> => {
  const result = await query(
    `SELECT
       COUNT(DISTINCT ri.receipt_id) as total_purchases,
       SUM(ri.quantity) as total_quantity,
       AVG(ri.unit_price) as average_price,
       MIN(ri.unit_price) as lowest_price,
       MAX(ri.unit_price) as highest_price
     FROM receipt_items ri
     WHERE ri.product_id = $1`,
    [productId]
  );

  const row = result.rows[0];

  if (!row || row.total_purchases === '0') {
    return null;
  }

  return {
    totalPurchases: parseInt(row.total_purchases),
    totalQuantity: parseFloat(row.total_quantity),
    averagePrice: parseFloat(row.average_price),
    lowestPrice: parseFloat(row.lowest_price),
    highestPrice: parseFloat(row.highest_price),
  };
};

/**
 * Get top products by purchase count
 */
export const getTopProducts = async (limit: number = 10): Promise<
  Array<{
    product: Product;
    purchaseCount: number;
    totalQuantity: number;
  }>
> => {
  const result = await query(
    `SELECT
       p.*,
       COUNT(DISTINCT ri.receipt_id) as purchase_count,
       SUM(ri.quantity) as total_quantity
     FROM products p
     JOIN receipt_items ri ON p.id = ri.product_id
     GROUP BY p.id
     ORDER BY purchase_count DESC, total_quantity DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((row) => ({
    product: {
      id: row.id,
      name: row.name,
      normalized_name: row.normalized_name,
      category: row.category,
      unit: row.unit,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    purchaseCount: parseInt(row.purchase_count),
    totalQuantity: parseFloat(row.total_quantity),
  }));
};
