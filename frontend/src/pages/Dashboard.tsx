import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { analyticsService } from '../services/analytics.service';
import { SpendingSummary, SpendingTrendItem } from '../types/analytics.types';
import { DollarSign, ShoppingCart, TrendingUp, Receipt, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [trend, setTrend] = useState<SpendingTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, trendData] = await Promise.all([
        analyticsService.getSummary('month'),
        analyticsService.getSpendingTrend(30, 'day'),
      ]);
      setSummary(summaryData);
      setTrend(trendData);
    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard');
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

  const formatChartData = (data: SpendingTrendItem[]) => {
    return data.map((item) => ({
      date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
      valor: item.totalSpent,
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="card max-w-md mx-auto text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary mt-4">
            Tentar Novamente
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus gastos</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Total Gasto (Mês)"
              value={formatCurrency(summary.totalSpent)}
              icon={DollarSign}
              change={summary.comparedToLastPeriod?.spentChange}
              iconColor="text-green-600"
            />
            <SummaryCard
              title="Compras Realizadas"
              value={summary.numberOfPurchases}
              icon={ShoppingCart}
              change={summary.comparedToLastPeriod?.purchasesChange}
              iconColor="text-blue-600"
            />
            <SummaryCard
              title="Ticket Médio"
              value={formatCurrency(summary.averageTicket)}
              icon={TrendingUp}
              iconColor="text-purple-600"
            />
          </div>
        )}

        {/* Spending Trend Chart */}
        {trend.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Gastos ao Longo do Tempo
            </h2>
            <p className="text-sm text-gray-600 mb-6">Últimos 30 dias</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formatChartData(trend)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/receipts/add" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Adicionar Cupom</h3>
                <p className="text-sm text-gray-600">Escaneie um novo cupom fiscal</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          <Link to="/analytics" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Ver Análises</h3>
                <p className="text-sm text-gray-600">Relatórios detalhados</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>

        {/* Empty State */}
        {summary && summary.numberOfPurchases === 0 && (
          <div className="card text-center py-12">
            <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum cupom cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seu primeiro cupom fiscal
            </p>
            <Link to="/receipts/add" className="btn-primary inline-flex items-center">
              <Receipt className="w-4 h-4 mr-2" />
              Adicionar Cupom
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
