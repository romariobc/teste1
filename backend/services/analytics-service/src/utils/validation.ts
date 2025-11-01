import { z } from 'zod';

/**
 * Summary query parameters schema
 */
export const summaryQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
});

/**
 * Top products query parameters schema
 */
export const topProductsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
  period: z.enum(['week', 'month', 'year', 'all']).default('all'),
});

/**
 * Spending trend query parameters schema
 */
export const spendingTrendQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

/**
 * Stores compare query parameters schema
 */
export const storesCompareQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
  productId: z.string().uuid().optional(),
});
