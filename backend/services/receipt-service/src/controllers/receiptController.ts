import { Request, Response } from 'express';
import { uploadReceiptSchema, listReceiptsQuerySchema } from '../utils/validation';
import {
  createReceipt,
  findReceiptWithItems,
  listUserReceipts,
  deleteReceipt,
  receiptExistsByQRCode,
} from '../models/Receipt';
import { fetchNFCeXML, parseNFCeXML } from '../parsers/nfceParser';
import { findOrCreateProduct, registerPrice } from '../services/productsService';

/**
 * Upload and process receipt from QR code
 * POST /upload
 */
export const uploadReceipt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Validate input
    const validatedData = uploadReceiptSchema.parse({
      ...req.body,
      userId,
    });

    // Check if receipt already exists
    const exists = await receiptExistsByQRCode(userId, validatedData.qrCodeData);
    if (exists) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Receipt already uploaded',
      });
    }

    // Step 1: Fetch XML from QR code
    console.log('📄 Fetching NFC-e XML...');
    const xmlData = await fetchNFCeXML(validatedData.qrCodeData);

    // Step 2: Parse XML
    console.log('🔍 Parsing NFC-e XML...');
    const parsedReceipt = await parseNFCeXML(xmlData);

    // Step 3: Process each product and create receipt items
    console.log(`📦 Processing ${parsedReceipt.items.length} items...`);
    const receiptItems = [];

    for (const item of parsedReceipt.items) {
      // Find or create product
      const product = await findOrCreateProduct(item.name, item.unit);

      // Register price in history
      await registerPrice(product.id, parsedReceipt.storeCnpj, item.unitPrice);

      // Prepare receipt item
      receiptItems.push({
        receiptId: '', // Will be set after receipt creation
        productId: product.id,
        productNameOriginal: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
    }

    // Step 4: Create receipt with items (transaction)
    console.log('💾 Saving receipt to database...');
    const result = await createReceipt(
      {
        userId,
        qrCodeData: validatedData.qrCodeData,
        storeName: parsedReceipt.storeName,
        storeCnpj: parsedReceipt.storeCnpj,
        totalAmount: parsedReceipt.totalAmount,
        purchaseDate: parsedReceipt.purchaseDate,
        receiptNumber: parsedReceipt.receiptNumber,
        xmlData,
      },
      receiptItems
    );

    console.log(`✅ Receipt created successfully: ${result.receipt.id}`);

    return res.status(201).json({
      message: 'Receipt processed successfully',
      receipt: {
        id: result.receipt.id,
        storeName: result.receipt.store_name,
        storeCnpj: result.receipt.store_cnpj,
        totalAmount: result.receipt.total_amount,
        purchaseDate: result.receipt.purchase_date,
        itemCount: result.items.length,
        createdAt: result.receipt.created_at,
      },
      items: result.items.map((item) => ({
        id: item.id,
        productName: item.product_name_original,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })),
    });
  } catch (error: any) {
    console.error('Upload receipt error:', error);

    // Validation error
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.errors,
      });
    }

    // Parser error
    if (error.message.includes('parse')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid receipt data or QR code',
        details: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not process receipt',
    });
  }
};

/**
 * List user receipts with pagination and filters
 * GET /
 */
export const listReceipts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Validate query params
    const queryParams = listReceiptsQuerySchema.parse(req.query);

    // Get receipts
    const { receipts, total } = await listUserReceipts(userId, queryParams);

    const totalPages = Math.ceil(total / queryParams.limit);

    return res.status(200).json({
      receipts: receipts.map((receipt) => ({
        id: receipt.id,
        storeName: receipt.store_name,
        storeCnpj: receipt.store_cnpj,
        totalAmount: receipt.total_amount,
        purchaseDate: receipt.purchase_date,
        receiptNumber: receipt.receipt_number,
        createdAt: receipt.created_at,
      })),
      pagination: {
        page: queryParams.page,
        limit: queryParams.limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('List receipts error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not list receipts',
    });
  }
};

/**
 * Get receipt details with items
 * GET /:id
 */
export const getReceiptDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const receiptId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Get receipt with items
    const result = await findReceiptWithItems(receiptId);

    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Receipt not found',
      });
    }

    // Check if receipt belongs to user
    if (result.receipt.user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    return res.status(200).json({
      receipt: {
        id: result.receipt.id,
        storeName: result.receipt.store_name,
        storeCnpj: result.receipt.store_cnpj,
        totalAmount: result.receipt.total_amount,
        purchaseDate: result.receipt.purchase_date,
        receiptNumber: result.receipt.receipt_number,
        createdAt: result.receipt.created_at,
      },
      items: result.items.map((item) => ({
        id: item.id,
        productName: item.product_name_original,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
      })),
    });
  } catch (error: any) {
    console.error('Get receipt details error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not get receipt details',
    });
  }
};

/**
 * Delete receipt
 * DELETE /:id
 */
export const removeReceipt = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const receiptId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // First check if receipt exists and belongs to user
    const result = await findReceiptWithItems(receiptId);

    if (!result) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Receipt not found',
      });
    }

    if (result.receipt.user_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    // Delete receipt (cascade to items)
    await deleteReceipt(receiptId);

    return res.status(200).json({
      message: 'Receipt deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete receipt error:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Could not delete receipt',
    });
  }
};
