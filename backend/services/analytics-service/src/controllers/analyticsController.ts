import { Request, Response } from 'express';
import {
  summaryQuerySchema,
  topProductsQuerySchema,
  spendingTrendQuerySchema,
  storesCompareQuerySchema,
} from '../utils/validation';
import {
  getSpendingSummary,
  getTopProducts,
  getSpendingTrend,
  getPriceFluctuation,
  compareStores,
} from '../models/Analytics';

/**
 * Get spending summary
 * GET /summary
 */
export const getSummaryController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Validate query params
    const queryParams = summaryQuerySchema.parse(req.query);

    // Get summary
    const summary = await getSpendingSummary(userId, queryParams.period);

    return res.status(200).json(summary);
  } catch (error: any) {
    console.error('Get summary error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get spending summary',
    });
  }
};

/**
 * Get top products
 * GET /products/top
 */
export const getTopProductsController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Validate query params
    const queryParams = topProductsQuerySchema.parse(req.query);

    // Get top products
    const products = await getTopProducts(userId, queryParams.limit, queryParams.period);

    return res.status(200).json({
      products,
      count: products.length,
    });
  } catch (error: any) {
    console.error('Get top products error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get top products',
    });
  }
};

/**
 * Get spending trend
 * GET /spending-trend
 */
export const getSpendingTrendController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Validate query params
    const queryParams = spendingTrendQuerySchema.parse(req.query);

    // Get spending trend
    const trend = await getSpendingTrend(userId, queryParams.days, queryParams.groupBy);

    return res.status(200).json({
      trend,
      period: `${queryParams.days} days`,
      groupBy: queryParams.groupBy,
    });
  } catch (error: any) {
    console.error('Get spending trend error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get spending trend',
    });
  }
};

/**
 * Get price fluctuation for a product
 * GET /price-fluctuation/:productId
 */
export const getPriceFluctuationController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.productId;

    // Get price fluctuation
    const fluctuation = await getPriceFluctuation(userId, productId);

    if (!fluctuation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json(fluctuation);
  } catch (error: any) {
    console.error('Get price fluctuation error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get price fluctuation',
    });
  }
};

/**
 * Compare stores
 * GET /stores/compare
 */
export const compareStoresController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Validate query params
    const queryParams = storesCompareQuerySchema.parse(req.query);

    // Compare stores
    const stores = await compareStores(userId, queryParams.limit, queryParams.productId);

    return res.status(200).json({
      stores,
      count: stores.length,
    });
  } catch (error: any) {
    console.error('Compare stores error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not compare stores',
    });
  }
};
