import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Loader2, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, FileText, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatPhoneForWhatsapp } from '../../lib/utils';
import { supabase, type Order, type OrderItem } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const STATUS_MAP = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pago', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregue', icon: Package, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', icon: Filter, color: 'bg-gray-100 text-gray-800' },
};

export default function Orders() {
  const { store } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (store?.id) {
      fetchOrders();
    }
  }, [store?.id]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      toast({ title: 'Erro', description: 'Falha ao carregar pedidos.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      setLoadingItems(true);
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os itens do pedido.', type: 'error' });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
      toast({ title: 'Sucesso', description: `Status atualizado para ${STATUS_MAP[newStatus as keyof typeof STATUS_MAP].label}`, type: 'success' });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast({ title: 'Erro', description: 'Erro ao atualizar status.', type: 'error' });
    }
  };

  const getCustomerWhatsappLink = (order: Order) => {
    if (!order.customer_phone) return null;
    const phone = formatPhoneForWhatsapp(order.customer_phone);
    const message = encodeURIComponent(
      `Olá ${order.customer_name}, aqui é da ${store?.name}. Estou entrando em contato sobre seu pedido #${order.id.slice(0, 8)}.`
    );
    return `https://wa.me/55${phone}?text=${message}`;
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pedidos</h2>
        <p className="text-gray-500">Gerencie e acompanhe as vendas da sua loja.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Buscar por cliente ou ID..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Pedido</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredOrders.map((order) => {
                    const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.city}, {order.state}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes do Pedido Modal */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Detalhes do Pedido #${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
        className="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Status Atual:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[selectedOrder.status].color}`}>
                  {STATUS_MAP[selectedOrder.status].label}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedOrder.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedOrder.id, 'paid')}>
                    Marcar como Pago
                  </Button>
                )}
                {selectedOrder.status === 'paid' && (
                  <Button size="sm" variant="default" onClick={() => updateStatus(selectedOrder.id, 'shipped')}>
                    Marcar como Enviado
                  </Button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(selectedOrder.id, 'delivered')}>
                    Confirmar Entrega
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Cliente e Entrega */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Endereço de Entrega
                  </h4>
                  {selectedOrder.customer_phone && (
                    <a 
                      href={getCustomerWhatsappLink(selectedOrder) || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1 text-green-600 hover:text-green-700 font-medium bg-green-50 px-2 py-1 rounded-full"
                    >
                      <MessageCircle className="h-3 w-3" /> WhatsApp
                    </a>
                  )}
                </div>
                <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-3">
                  <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
                  <p>{selectedOrder.address_line1}</p>
                  {selectedOrder.address_line2 && <p>{selectedOrder.address_line2}</p>}
                  <p>{selectedOrder.city} - {selectedOrder.state}</p>
                  <p>{selectedOrder.zip_code}</p>
                </div>

                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mt-4">
                  <Phone className="h-4 w-4 text-indigo-600" />
                  Contato
                </h4>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {selectedOrder.customer_email}</p>
                  <p className="flex items-center gap-2 mt-1"><Phone className="h-3 w-3" /> {selectedOrder.customer_phone}</p>
                </div>
              </div>

              {/* Itens do Pedido (Packing List) */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Itens do Pedido (Packing List)
                </h4>
                
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  {loadingItems ? (
                    <div className="p-4 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 text-gray-900">{item.product_name}</td>
                            <td className="px-3 py-2 text-center text-gray-600">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-gray-900">{formatCurrency(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan={2} className="px-3 py-2 text-right font-bold text-gray-900">Total</td>
                          <td className="px-3 py-2 text-right font-bold text-indigo-600">{formatCurrency(selectedOrder.total_amount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
