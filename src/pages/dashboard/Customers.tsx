import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerMetric {
  email: string;
  name: string;
  phone: string | null;
  city: string;
  state: string;
  total_spent: number;
  orders_count: number;
  last_order_date: string;
}

export default function Customers() {
  const { store } = useAuth();
  const [customers, setCustomers] = useState<CustomerMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (store?.id) {
      fetchCustomers();
    }
  }, [store?.id]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // Buscamos todos os pedidos para agregar os dados dos clientes
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agregação de dados em memória (CRM simples)
      const customerMap = new Map<string, CustomerMetric>();

      orders?.forEach(order => {
        const email = order.customer_email.toLowerCase();
        
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email: order.customer_email,
            name: order.customer_name,
            phone: order.customer_phone,
            city: order.city,
            state: order.state,
            total_spent: 0,
            orders_count: 0,
            last_order_date: order.created_at
          });
        }

        const customer = customerMap.get(email)!;
        customer.total_spent += order.total_amount;
        customer.orders_count += 1;
        // Como ordenamos por data desc, a primeira vez que encontramos é a última data
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Clientes</h2>
        <p className="text-gray-500">Base de clientes construída a partir do histórico de pedidos.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Buscar por nome ou email..." 
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
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum cliente identificado ainda.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Contato</th>
                    <th className="px-4 py-3">Localização</th>
                    <th className="px-4 py-3 text-center">Pedidos</th>
                    <th className="px-4 py-3 text-right">Total Gasto (LTV)</th>
                    <th className="px-4 py-3 text-right">Última Compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCustomers.map((customer, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {customer.city}, {customer.state}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {customer.orders_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {new Date(customer.last_order_date).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
