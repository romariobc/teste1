import api from './api';
import { Product, PriceHistoryItem, PriceComparison, PriceStats } from '../types/product.types';

export const productService = {
  /**
   * List all products
   */
  async listProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<{ products: Product[]; total: number }> {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  /**
   * Get product details
   */
  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Get product price history
   */
  async getPriceHistory(id: string): Promise<PriceHistoryItem[]> {
    const response = await api.get<{ history: PriceHistoryItem[] }>(`/api/products/${id}/price-history`);
    return response.data.history;
  },

  /**
   * Compare prices across stores
   */
  async comparePrices(id: string): Promise<{ comparisons: PriceComparison[]; bestPrice: PriceComparison | null }> {
    const response = await api.get(`/api/products/${id}/compare-prices`);
    return response.data;
  },

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10): Promise<Product[]> {
    const response = await api.get<{ products: Product[] }>('/api/products/top', {
      params: { limit },
    });
    return response.data.products;
  },
};
