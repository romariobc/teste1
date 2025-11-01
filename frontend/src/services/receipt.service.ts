import api from './api';
import { Receipt, ReceiptWithItems, CreateReceiptInput } from '../types/receipt.types';

export const receiptService = {
  /**
   * Upload new receipt
   */
  async uploadReceipt(data: CreateReceiptInput): Promise<ReceiptWithItems> {
    const response = await api.post<ReceiptWithItems>('/api/receipts', data);
    return response.data;
  },

  /**
   * List user receipts
   */
  async listReceipts(params?: {
    page?: number;
    limit?: number;
    storeName?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ receipts: Receipt[]; total: number; page: number; totalPages: number }> {
    const response = await api.get('/api/receipts', { params });
    return response.data;
  },

  /**
   * Get receipt details
   */
  async getReceiptDetails(id: string): Promise<ReceiptWithItems> {
    const response = await api.get<ReceiptWithItems>(`/api/receipts/${id}`);
    return response.data;
  },

  /**
   * Delete receipt
   */
  async deleteReceipt(id: string): Promise<void> {
    await api.delete(`/api/receipts/${id}`);
  },
};
