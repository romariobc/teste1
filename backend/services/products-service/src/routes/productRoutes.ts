import { Router } from 'express';
import {
  listProductsController,
  getProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  normalizeProductController,
  getPriceHistoryController,
  comparePricesController,
  getPriceTrendController,
  getTopProductsController,
} from '../controllers/productController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

/**
 * POST /normalize
 * Normalize product (public - used by Receipt Service)
 */
router.post('/normalize', normalizeProductController);

/**
 * GET /top
 * Get top products by purchase count
 */
router.get('/top', getTopProductsController);

// All other routes require authentication
router.use(authMiddleware);

/**
 * GET /
 * List products with pagination and filters
 */
router.get('/', listProductsController);

/**
 * POST /
 * Create new product
 */
router.post('/', createProductController);

/**
 * GET /:id
 * Get product details
 */
router.get('/:id', getProductController);

/**
 * PUT /:id
 * Update product
 */
router.put('/:id', updateProductController);

/**
 * DELETE /:id
 * Delete product
 */
router.delete('/:id', deleteProductController);

/**
 * GET /:id/history
 * Get product price history
 */
router.get('/:id/history', getPriceHistoryController);

/**
 * GET /:id/compare
 * Compare prices across stores
 */
router.get('/:id/compare', comparePricesController);

/**
 * GET /:id/trend
 * Get price trend
 */
router.get('/:id/trend', getPriceTrendController);

export default router;
