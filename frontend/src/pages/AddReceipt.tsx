import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { receiptService } from '../services/receipt.service';
import { Receipt, QrCode, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function AddReceipt() {
  const [qrCodeData, setQrCodeData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const result = await receiptService.uploadReceipt({ qrCodeData });
      setSuccess(true);
      
      // Redirect to receipt details after 1.5 seconds
      setTimeout(() => {
        navigate(`/receipts/${result.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar cupom fiscal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Cupom Fiscal</h1>
          <p className="text-gray-600 mt-2">
            Cole o código ou URL do QR code do cupom fiscal
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Cupom processado com sucesso!</p>
              <p className="text-sm text-green-700 mt-1">Redirecionando para detalhes...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* QR Code Input */}
            <div>
              <label htmlFor="qrCodeData" className="label">
                <QrCode className="w-4 h-4 inline mr-2" />
                Código do Cupom Fiscal
              </label>
              <textarea
                id="qrCodeData"
                value={qrCodeData}
                onChange={(e) => setQrCodeData(e.target.value)}
                className="input min-h-32"
                placeholder="Cole aqui o código ou URL do QR code..."
                required
                disabled={isLoading || success}
              />
              <p className="text-sm text-gray-500 mt-2">
                Exemplo: http://www.fazenda.sp.gov.br/nfce/...
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Como obter o código?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Escaneie o QR code com a câmera do celular</li>
                <li>• Copie a URL que abre</li>
                <li>• Cole aqui no campo acima</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={isLoading || success}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 inline mr-2" />
                    Adicionar Cupom
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/receipts')}
                className="btn-secondary"
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Demo Data */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-2">
            Para testar, você pode usar um código de exemplo:
          </p>
          <button
            onClick={() => setQrCodeData('DEMO_QR_CODE_12345')}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full"
            disabled={isLoading || success}
          >
            Usar código de demonstração
          </button>
        </div>
      </div>
    </Layout>
  );
}
