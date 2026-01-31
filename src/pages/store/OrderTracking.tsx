import { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle, Truck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { supabase, type Store, type Order } from '../../lib/supabase';
import { formatCurrency, cn } from '../../lib/utils';
import { SEO } from '../../components/SEO';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pendente', icon: Clock },
  { key: 'paid', label: 'Pagamento Aprovado', icon: CheckCircle },
  { key: 'shipped', label: 'Em Trânsito', icon: Truck },
  { key: 'delivered', label: 'Entregue', icon: Package },
];

export default function OrderTracking() {
  const { store } = useOutletContext<{ store: Store }>();
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    const formData = new FormData(e.currentTarget);
    const orderId = formData.get('orderId') as string;
    const email = formData.get('email') as string;

    try {
      // Tenta buscar o pedido. Nota: ID deve ser exato (UUID)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .ilike('customer_email', email.trim())
        .eq('store_id', store.id)
        .single();

      if (error || !data) {
        throw new Error('Pedido não encontrado. Verifique os dados e tente novamente.');
      }

      setOrder(data);
    } catch (err: any) {
      setError('Não encontramos um pedido com esses dados. Verifique o ID e o email.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <SEO 
        title="Rastrear Pedido" 
        description="Acompanhe o status da sua entrega."
        storeName={store.name}
      />

      <Link to={`/s/${store.slug}`}>
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a loja
        </Button>
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rastrear Pedido</h1>
        <p className="text-gray-500 mt-2">Digite o número do pedido e seu email para acompanhar a entrega.</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Número do Pedido (ID)</label>
                <Input name="orderId" placeholder="Ex: 550e8400-e29b..." required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email da Compra</label>
                <Input name="email" type="email" placeholder="seu@email.com" required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Buscando...' : 'Rastrear'} <Search className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-8">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {order && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <CardTitle>Status do Pedido</CardTitle>
              <span className="font-mono text-sm text-gray-500">#{order.id.slice(0, 8)}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {order.status === 'cancelled' ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Pedido Cancelado</h3>
                <p className="text-gray-500">Entre em contato com a loja para mais informações.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 md:left-0 md:right-0 md:top-5 md:h-0.5 md:w-full" />

                <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                  {STATUS_STEPS.map((step, index) => {
                    const currentStepIndex = getCurrentStepIndex(order.status);
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-white",
                          isCompleted 
                            ? "border-indigo-600 bg-indigo-600 text-white" 
                            : "border-gray-300 text-gray-300"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="md:text-center">
                          <p className={cn(
                            "font-medium text-sm",
                            isCompleted ? "text-gray-900" : "text-gray-400"
                          )}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-indigo-600 font-medium animate-pulse">
                              Atual
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Endereço de Entrega</h4>
                    <p className="text-sm text-gray-600">
                      {order.address_line1}, {order.address_line2}
                      <br />
                      {order.city} - {order.state}
                      <br />
                      CEP: {order.zip_code}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <h4 className="font-medium text-gray-900 mb-1">Resumo</h4>
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Pedido realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
