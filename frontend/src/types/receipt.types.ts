export interface Receipt {
  id: string;
  userId: string;
  qrCodeData: string;
  storeName: string | null;
  storeCnpj: string | null;
  purchaseDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ReceiptWithItems extends Receipt {
  items: ReceiptItem[];
}

export interface CreateReceiptInput {
  qrCodeData: string;
}
