import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Copy, Check, QrCode, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { type Store } from '../../lib/supabase';
import { useState } from 'react';
import { formatPhoneForWhatsapp } from '../../lib/utils';

export default function OrderSuccess() {
  const { store } = useOutletContext<{ store: Store }>();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const paymentMethod = location.state?.paymentMethod;
  const [copied, setCopied] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPix = () => {
    if (store.pix_key) {
      navigator.clipboard.writeText(store.pix_key);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  const getWhatsappLink = () => {
    if (!store.phone || !orderId) return null;
    const phone = formatPhoneForWhatsapp(store.phone);
    const message = encodeURIComponent(
      `Olá, acabei de fazer o pedido #${orderId.slice(0, 8)} na ${store.name}.` +
      (paymentMethod === 'pix' ? ' Segue o comprovante de pagamento.' : '')
    );
    return `https://wa.me/55${phone}?text=${message}`;
  };

  const whatsappLink = getWhatsappLink();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Realizado com Sucesso!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Obrigado pela sua compra. Guarde o número do seu pedido para rastrear a entrega.
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
        {/* Info do Pedido */}
        <div className="bg-gray-50 px-6 py-6 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-1">Número do Pedido</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-lg font-mono font-bold text-gray-900 truncate max-w-[200px]">{orderId}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={handleCopy}
              title="Copiar ID"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Link to={`/s/${store.slug}/track`} className="text-sm text-indigo-600 hover:underline">
            Rastrear este pedido
          </Link>
        </div>

        {/* Pagamento Pix */}
        {paymentMethod === 'pix' && store.pix_key && (
          <div className="bg-indigo-50 px-6 py-6 rounded-lg border border-indigo-100 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
              <QrCode className="h-5 w-5" /> Pagamento via Pix
            </div>
            <p className="text-sm text-gray-600 mb-3">Chave Pix:</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-indigo-100 w-full mb-3">
              <code className="text-sm flex-1 truncate">{store.pix_key}</code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={handleCopyPix}
              >
                {pixCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            {store.pix_instructions && (
              <p className="text-xs text-gray-500">{store.pix_instructions}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar Comprovante
            </Button>
          </a>
        )}
        <Link to={`/s/${store.slug}`} className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuar Comprando
          </Button>
        </Link>
      </div>
    </div>
  );
}
