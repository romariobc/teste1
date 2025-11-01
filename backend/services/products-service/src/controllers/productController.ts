import { Request, Response } from 'express';
import {
  productSchema,
  normalizeSchema,
  listProductsQuerySchema,
  priceHistoryQuerySchema,
} from '../utils/validation';
import {
  createProduct,
  findProductById,
  listProducts,
  updateProduct,
  deleteProduct,
  getProductStats,
  getTopProducts,
} from '../models/Product';
import {
  normalizeProductName,
  categorizeProduct,
  findOrCreateProduct,
} from '../services/normalizationService';
import {
  getPriceHistory,
  comparePrices,
  getPriceStats,
  getPriceTrend,
  findBestPrice,
} from '../services/priceService';

/**
 * List products with pagination and filters
 * GET /
 */
export const listProductsController = async (req: Request, res: Response) => {
  try {
    // Validate query params
    const queryParams = listProductsQuerySchema.parse(req.query);

    // Get products
    const { products, total } = await listProducts(queryParams);

    const totalPages = Math.ceil(total / queryParams.limit);

    return res.status(200).json({
      products,
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('List products error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not list products',
    });
  }
};

/**
 * Get product details
 * GET /:id
 */
export const getProductController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    // Get product statistics
    const stats = await getProductStats(productId);

    return res.status(200).json({
      product,
      statistics: stats,
    });
  } catch (error: any) {
    console.error('Get product error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get product details',
    });
  }
};

/**
 * Create product (manual)
 * POST /
 */
export const createProductController = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = productSchema.parse(req.body);

    // Normalize name
    const normalizedName = normalizeProductName(validatedData.name);

    // Auto-categorize if not provided
    const category = validatedData.category || categorizeProduct(validatedData.name);

    // Create product
    const product = await createProduct({
      name: validatedData.name,
      normalizedName,
      category,
      unit: validatedData.unit || 'UN',
    });

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    console.error('Create product error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    // Duplicate normalized name
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Product with similar name already exists',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not create product',
    });
  }
};

/**
 * Update product
 * PUT /:id
 */
export const updateProductController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    // Validate input
    const validatedData = productSchema.partial().parse(req.body);

    // If name is being updated, update normalized name too
    const updates: any = { ...validatedData };
    if (validatedData.name) {
      updates.normalizedName = normalizeProductName(validatedData.name);
    }

    // Update product
    const product = await updateProduct(productId, updates);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error: any) {
    console.error('Update product error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not update product',
    });
  }
};

/**
 * Delete product
 * DELETE /:id
 */
export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    const deleted = await deleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);

    // Foreign key constraint (product has receipts)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot delete product with existing receipts',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete product',
    });
  }
};

/**
 * Normalize product (for Receipt Service)
 * POST /normalize
 */
export const normalizeProductController = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validatedData = normalizeSchema.parse(req.body);

    // Find or create product
    const product = await findOrCreateProduct(validatedData.name, validatedData.unit);

    return res.status(200).json({
      product,
    });
  } catch (error: any) {
    console.error('Normalize product error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not normalize product',
    });
  }
};

/**
 * Get product price history
 * GET /:id/history
 */
export const getPriceHistoryController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    // Validate query params
    const queryParams = priceHistoryQuerySchema.parse(req.query);

    // Get price history
    const history = await getPriceHistory(productId, queryParams);

    // Get price stats
    const stats = await getPriceStats(productId);

    return res.status(200).json({
      history,
      statistics: stats,
    });
  } catch (error: any) {
    console.error('Get price history error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get price history',
    });
  }
};

/**
 * Compare prices across stores
 * GET /:id/compare
 */
export const comparePricesController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;

    // Get product
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    // Compare prices
    const comparison = await comparePrices(productId);

    // Get best price
    const bestPrice = await findBestPrice(productId);

    return res.status(200).json({
      product,
      stores: comparison,
      bestPrice,
    });
  } catch (error: any) {
    console.error('Compare prices error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not compare prices',
    });
  }
};

/**
 * Get price trend
 * GET /:id/trend
 */
export const getPriceTrendController = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const days = parseInt(req.query.days as string) || 30;

    // Get product
    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found',
      });
    }

    // Get price trend
    const trend = await getPriceTrend(productId, days);

    return res.status(200).json({
      product,
      trend,
      period: `${days} days`,
    });
  } catch (error: any) {
    console.error('Get price trend error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get price trend',
    });
  }
};

/**
 * Get top products
 * GET /top
 */
export const getTopProductsController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topProducts = await getTopProducts(limit);

    return res.status(200).json({
      products: topProducts,
      count: topProducts.length,
    });
  } catch (error: any) {
    console.error('Get top products error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get top products',
    });
  }
};
