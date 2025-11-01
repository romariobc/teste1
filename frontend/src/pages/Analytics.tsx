import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { analyticsService } from '../services/analytics.service';
import { TopProduct } from '../types/analytics.types';
import { TrendingUp, Package, Store } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const products = await analyticsService.getTopProducts(10);
      setTopProducts(products);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const chartData = topProducts.map((p) => ({
    name: p.productName.substring(0, 20),
    compras: p.purchaseCount,
  }));

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando análises...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análises</h1>
          <p className="text-gray-600 mt-1">Insights sobre seus gastos e produtos</p>
        </div>

        {/* Top Products Chart */}
        {topProducts.length > 0 && (
          <div className="card">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Top 10 Produtos Mais Comprados
              </h2>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="compras" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Products List */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">
              Detalhes dos Produtos
            </h2>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.productName}</h3>
                    <p className="text-sm text-gray-600">
                      {product.purchaseCount}x comprado • {product.totalQuantity} unidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.totalSpent)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Média: {formatCurrency(product.avgPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {topProducts.length === 0 && (
          <div className="card text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma análise disponível
            </h3>
            <p className="text-gray-600">Adicione cupons para ver análises</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
