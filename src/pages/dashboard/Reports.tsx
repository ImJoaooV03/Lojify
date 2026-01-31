import { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Loader2, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function Reports() {
  const { store } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    if (store?.id) {
      fetchData();
    }
  }, [store?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, total_amount, status')
        .eq('store_id', store!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Processar dados para o gráfico de vendas (agrupar por dia)
      const salesMap = new Map();
      const statusMap = new Map();

      orders?.forEach(order => {
        // Sales by Date
        const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        salesMap.set(date, (salesMap.get(date) || 0) + order.total_amount);

        // Orders by Status
        const status = order.status === 'pending' ? 'Pendente' : 
                       order.status === 'paid' ? 'Pago' :
                       order.status === 'shipped' ? 'Enviado' : 
                       order.status === 'delivered' ? 'Entregue' : order.status;
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      const chartData = Array.from(salesMap.entries()).map(([date, amount]) => ({
        name: date,
        amount: amount
      }));

      const statusChartData = Array.from(statusMap.entries()).map(([status, count]) => ({
        name: status,
        count: count
      }));

      setSalesData(chartData);
      setStatusData(statusChartData);

    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Relatórios</h2>
        <p className="text-gray-500">Análise de desempenho da sua loja.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Vendas */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Vendas por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Sem dados de vendas suficientes.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status dos Pedidos */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Pedidos por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                Sem dados de pedidos.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
