import { Router } from 'express';
import { authMiddleware } from '../utils/authMiddleware';
import {
  getSummaryController,
  getTopProductsController,
  getSpendingTrendController,
  getPriceFluctuationController,
  compareStoresController,
} from '../controllers/analyticsController';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * GET /summary
 * Get spending summary for a period
 * Query params: period (day|week|month|year)
 */
router.get('/summary', getSummaryController);

/**
 * GET /products/top
 * Get top products by purchase count
 * Query params: limit (number), period (week|month|year|all)
 */
router.get('/products/top', getTopProductsController);

/**
 * GET /spending-trend
 * Get spending trend over time
 * Query params: days (number), groupBy (day|week|month)
 */
router.get('/spending-trend', getSpendingTrendController);

/**
 * GET /price-fluctuation/:productId
 * Get price fluctuation for a specific product
 */
router.get('/price-fluctuation/:productId', getPriceFluctuationController);

/**
 * GET /stores/compare
 * Compare stores by spending
 * Query params: limit (number), productId (uuid, optional)
 */
router.get('/stores/compare', compareStoresController);

export default router;
