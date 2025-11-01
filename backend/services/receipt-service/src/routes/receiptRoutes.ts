import { Router } from 'express';
import {
  uploadReceipt,
  listReceipts,
  getReceiptDetails,
  removeReceipt,
} from '../controllers/receiptController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /upload
 * Upload and process receipt from QR code
 */
router.post('/upload', uploadReceipt);

/**
 * GET /
 * List user receipts with pagination and filters
 */
router.get('/', listReceipts);

/**
 * GET /:id
 * Get receipt details with items
 */
router.get('/:id', getReceiptDetails);

/**
 * DELETE /:id
 * Delete receipt
 */
router.delete('/:id', removeReceipt);

export default router;
