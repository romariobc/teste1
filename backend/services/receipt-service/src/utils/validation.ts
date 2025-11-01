import { z } from 'zod';

/**
 * Upload receipt validation schema
 */
export const uploadReceiptSchema = z.object({
  qrCodeData: z
    .string()
    .min(10, 'QR code data must be at least 10 characters')
    .max(1000, 'QR code data must be at most 1000 characters'),
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * List receipts query params validation
 */
export const listReceiptsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  storeName: z.string().optional(),
});

export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>;
export type ListReceiptsQuery = z.infer<typeof listReceiptsQuerySchema>;
