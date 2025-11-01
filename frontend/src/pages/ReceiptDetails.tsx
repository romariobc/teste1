import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { receiptService } from '../services/receipt.service';
import { ReceiptWithItems } from '../types/receipt.types';
import { ArrowLeft, Store, Calendar, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReceiptDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadReceipt();
    }
  }, [id]);

  const loadReceipt = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await receiptService.getReceiptDetails(id);
      setReceipt(data);
    } catch (err) {
      setError('Erro ao carregar detalhes do cupom');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir este cupom?');
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await receiptService.deleteReceipt(id);
      navigate('/receipts');
    } catch (err) {
      alert('Erro ao excluir cupom');
      console.error(err);
    } finally {
      setIsDeleting(false);
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
            <p className="mt-4 text-gray-600">Carregando detalhes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !receipt) {
    return (
      <Layout>
        <div className="card max-w-md mx-auto text-center">
          <p className="text-red-600">{error || 'Cupom não encontrado'}</p>
          <Link to="/receipts" className="btn-primary mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/receipts"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para cupons
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Cupom
              </>
            )}
          </button>
        </div>

        {/* Receipt Info */}
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Detalhes do Cupom Fiscal
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-gray-600 mb-2">
                <Store className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Loja</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {receipt.storeName || 'Não identificada'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                CNPJ: {receipt.storeCnpj || 'N/A'}
              </p>
            </div>

            <div>
              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Data da Compra</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(receipt.purchaseDate)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Total da Compra</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(receipt.totalAmount)}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Itens da Compra ({receipt.items.length})
          </h2>

          <div className="space-y-3">
            {receipt.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-primary-600">
                {formatCurrency(receipt.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
