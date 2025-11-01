import { z } from 'zod';

/**
 * Create/Update product validation schema
 */
export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must be at most 255 characters'),
  category: z
    .string()
    .max(100, 'Category must be at most 100 characters')
    .optional()
    .nullable(),
  unit: z
    .string()
    .max(20, 'Unit must be at most 20 characters')
    .optional()
    .nullable(),
});

/**
 * Normalize product validation schema
 */
export const normalizeSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must be at least 2 characters')
    .max(255, 'Product name must be at most 255 characters'),
  unit: z
    .string()
    .max(20, 'Unit must be at most 20 characters')
    .optional()
    .default('UN'),
});

/**
 * List products query params validation
 */
export const listProductsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  search: z.string().optional(),
  category: z.string().optional(),
});

/**
 * Price history query params validation
 */
export const priceHistoryQuerySchema = z.object({
  limit: z.string().optional().default('30').transform(Number),
  storeCnpj: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type NormalizeInput = z.infer<typeof normalizeSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type PriceHistoryQuery = z.infer<typeof priceHistoryQuerySchema>;
