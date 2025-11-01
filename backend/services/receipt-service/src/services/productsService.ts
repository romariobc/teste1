import axios from 'axios';
import { query } from '../utils/database';

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';

export interface Product {
  id: string;
  name: string;
  normalized_name: string;
  category: string | null;
  unit: string | null;
}

/**
 * Normalize product name
 * Converts to lowercase, removes accents, extra spaces
 */
export const normalizeProductName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Find or create product
 * First tries to find existing product by normalized name
 * If not found, creates a new product
 */
export const findOrCreateProduct = async (
  productName: string,
  unit: string = 'UN'
): Promise<Product> => {
  const normalizedName = normalizeProductName(productName);

  // Try to find existing product
  const existingResult = await query(
    `SELECT * FROM products WHERE normalized_name = $1 LIMIT 1`,
    [normalizedName]
  );

  if (existingResult.rows.length > 0) {
    console.log(`Found existing product: ${productName}`);
    return existingResult.rows[0];
  }

  // Create new product
  console.log(`Creating new product: ${productName}`);
  const createResult = await query(
    `INSERT INTO products (name, normalized_name, unit)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [productName, normalizedName, unit]
  );

  return createResult.rows[0];
};

/**
 * Register price in price history
 */
export const registerPrice = async (
  productId: string,
  storeCnpj: string,
  price: number
): Promise<void> => {
  await query(
    `INSERT INTO price_history (product_id, store_cnpj, price)
     VALUES ($1, $2, $3)`,
    [productId, storeCnpj, price]
  );

  console.log(`Registered price for product ${productId}: R$ ${price}`);
};

/**
 * Call Products Service to normalize product (Phase 4)
 * For now, we create products directly in the database
 * When Phase 4 is implemented, this will call the Products Service API
 */
export const callProductsService = async (
  productName: string,
  unit: string
): Promise<Product> => {
  try {
    // Try to call Products Service (will fail gracefully in Phase 3)
    const response = await axios.post(
      `${PRODUCTS_SERVICE_URL}/normalize`,
      {
        name: productName,
        unit: unit,
      },
      {
        timeout: 5000,
      }
    );

    return response.data.product;
  } catch (error: any) {
    // If Products Service is not available, create product directly
    console.log('Products Service not available, creating product directly');
    return findOrCreateProduct(productName, unit);
  }
};
