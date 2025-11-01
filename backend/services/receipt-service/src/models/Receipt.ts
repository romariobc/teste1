import { query, getClient } from '../utils/database';

export interface Receipt {
  id: string;
  user_id: string;
  qr_code_data: string;
  store_name: string | null;
  store_cnpj: string | null;
  total_amount: number;
  purchase_date: Date;
  receipt_number: string | null;
  xml_data: string | null;
  created_at: Date;
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  product_id: string;
  product_name_original: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface CreateReceiptInput {
  userId: string;
  qrCodeData: string;
  storeName: string | null;
  storeCnpj: string | null;
  totalAmount: number;
  purchaseDate: Date;
  receiptNumber: string | null;
  xmlData: string | null;
}

export interface CreateReceiptItemInput {
  receiptId: string;
  productId: string;
  productNameOriginal: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Create a new receipt with items (transaction)
 */
export const createReceipt = async (
  receiptInput: CreateReceiptInput,
  items: CreateReceiptItemInput[]
): Promise<{ receipt: Receipt; items: ReceiptItem[] }> => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Insert receipt
    const receiptResult = await client.query(
      `INSERT INTO receipts
       (user_id, qr_code_data, store_name, store_cnpj, total_amount, purchase_date, receipt_number, xml_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        receiptInput.userId,
        receiptInput.qrCodeData,
        receiptInput.storeName,
        receiptInput.storeCnpj,
        receiptInput.totalAmount,
        receiptInput.purchaseDate,
        receiptInput.receiptNumber,
        receiptInput.xmlData,
      ]
    );

    const receipt = receiptResult.rows[0];

    // Insert receipt items
    const insertedItems: ReceiptItem[] = [];
    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO receipt_items
         (receipt_id, product_id, product_name_original, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          receipt.id,
          item.productId,
          item.productNameOriginal,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
        ]
      );
      insertedItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return { receipt, items: insertedItems };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find receipt by ID
 */
export const findReceiptById = async (receiptId: string): Promise<Receipt | null> => {
  const result = await query(
    `SELECT * FROM receipts WHERE id = $1`,
    [receiptId]
  );

  return result.rows[0] || null;
};

/**
 * Find receipt with items
 */
export const findReceiptWithItems = async (
  receiptId: string
): Promise<{ receipt: Receipt; items: ReceiptItem[] } | null> => {
  const receipt = await findReceiptById(receiptId);

  if (!receipt) {
    return null;
  }

  const itemsResult = await query(
    `SELECT * FROM receipt_items WHERE receipt_id = $1 ORDER BY created_at`,
    [receiptId]
  );

  return {
    receipt,
    items: itemsResult.rows,
  };
};

/**
 * List user receipts with pagination
 */
export const listUserReceipts = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    storeName?: string;
  }
): Promise<{ receipts: Receipt[]; total: number }> => {
  const { page = 1, limit = 10, startDate, endDate, storeName } = options;
  const offset = (page - 1) * limit;

  // Build query with filters
  let whereConditions = ['user_id = $1'];
  let params: any[] = [userId];
  let paramCount = 2;

  if (startDate) {
    whereConditions.push(`purchase_date >= $${paramCount}`);
    params.push(startDate);
    paramCount++;
  }

  if (endDate) {
    whereConditions.push(`purchase_date <= $${paramCount}`);
    params.push(endDate);
    paramCount++;
  }

  if (storeName) {
    whereConditions.push(`store_name ILIKE $${paramCount}`);
    params.push(`%${storeName}%`);
    paramCount++;
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) FROM receipts WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get receipts
  const receiptsResult = await query(
    `SELECT * FROM receipts
     WHERE ${whereClause}
     ORDER BY purchase_date DESC
     LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
    [...params, limit, offset]
  );

  return {
    receipts: receiptsResult.rows,
    total,
  };
};

/**
 * Delete receipt (cascade to items)
 */
export const deleteReceipt = async (receiptId: string): Promise<boolean> => {
  const result = await query(
    `DELETE FROM receipts WHERE id = $1`,
    [receiptId]
  );

  return (result.rowCount || 0) > 0;
};

/**
 * Check if receipt already exists by QR code
 */
export const receiptExistsByQRCode = async (
  userId: string,
  qrCodeData: string
): Promise<boolean> => {
  const result = await query(
    `SELECT EXISTS(SELECT 1 FROM receipts WHERE user_id = $1 AND qr_code_data = $2) as exists`,
    [userId, qrCodeData]
  );

  return result.rows[0].exists;
};
