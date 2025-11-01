import api from './api';
import { SpendingSummary, SpendingTrendItem, TopProduct } from '../types/analytics.types';

export const analyticsService = {
  /**
   * Get spending summary
   */
  async getSummary(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<SpendingSummary> {
    const response = await api.get<SpendingSummary>('/api/analytics/summary', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10, period: 'week' | 'month' | 'year' | 'all' = 'all'): Promise<TopProduct[]> {
    const response = await api.get<{ products: TopProduct[] }>('/api/analytics/products/top', {
      params: { limit, period },
    });
    return response.data.products;
  },

  /**
   * Get spending trend
   */
  async getSpendingTrend(days: number = 30, groupBy: 'day' | 'week' | 'month' = 'day'): Promise<SpendingTrendItem[]> {
    const response = await api.get<{ trend: SpendingTrendItem[] }>('/api/analytics/spending-trend', {
      params: { days, groupBy },
    });
    return response.data.trend;
  },
};
