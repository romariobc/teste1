import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { receiptService } from '../services/receipt.service';
import { Receipt } from '../types/receipt.types';
import { Receipt as ReceiptIcon, Plus, Store, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const data = await receiptService.listReceipts({ limit: 50 });
      setReceipts(data.receipts);
    } catch (err) {
      setError('Erro ao carregar cupons');
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

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando cupons...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Cupons Fiscais</h1>
            <p className="text-gray-600 mt-1">
              {receipts.length} {receipts.length === 1 ? 'cupom cadastrado' : 'cupons cadastrados'}
            </p>
          </div>
          <Link to="/receipts/add" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cupom
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card bg-red-50 border border-red-200">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Receipts List */}
        {receipts.length > 0 ? (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <Link
                key={receipt.id}
                to={`/receipts/${receipt.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <ReceiptIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {receipt.storeName || 'Loja não identificada'}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Store className="w-4 h-4 mr-1" />
                          <span className="truncate">{receipt.storeCnpj || 'CNPJ não disponível'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(receipt.purchaseDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold text-gray-900">
                        <DollarSign className="w-5 h-5 mr-1 text-green-600" />
                        {formatCurrency(receipt.totalAmount)}
                      </div>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="card text-center py-12">
            <ReceiptIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum cupom cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando seu primeiro cupom fiscal
            </p>
            <Link to="/receipts/add" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cupom
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
