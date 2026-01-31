import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, ShoppingBag, Users, TrendingUp, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Overview() {
  const { store, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    customersCount: 0,
    averageTicket: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [checklist, setChecklist] = useState({
    hasProducts: false,
    hasCustomization: false,
    hasOrders: false
  });

  useEffect(() => {
    if (store?.id) {
      fetchDashboardData();
    } else if (!authLoading && !store) {
      // Se terminou de carregar o auth e não tem loja, paramos o loading local
      setLoading(false);
    }
  }, [store?.id, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*')
          .eq('store_id', store!.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', store!.id)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      
      const orders = ordersRes.data || [];
      const productsCount = productsRes.count || 0;

      const totalSales = orders.reduce((acc, order) => acc + order.total_amount, 0);
      const ordersCount = orders.length;
      const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;
      const averageTicket = ordersCount > 0 ? totalSales / ordersCount : 0;

      setStats({
        totalSales,
        ordersCount,
        customersCount: uniqueCustomers,
        averageTicket
      });

      setRecentSales(orders.slice(0, 5));

      setChecklist({
        hasProducts: productsCount > 0,
        hasCustomization: !!(store!.logo_url || store!.primary_color !== '#4f46e5'),
        hasOrders: ordersCount > 0
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Loja não encontrada</h2>
        <p className="text-gray-500 mt-2">Parece que houve um erro ao carregar os dados da sua loja.</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Visão Geral</h2>
        <p className="text-gray-500">Bem-vindo de volta! Aqui está o desempenho real da sua loja.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Vendas Totais", 
            value: stats.totalSales, 
            icon: DollarSign, 
            trend: "Vitalício" 
          },
          { 
            title: "Pedidos", 
            value: stats.ordersCount, 
            icon: ShoppingBag, 
            trend: "Total processado", 
            isCurrency: false 
          },
          { 
            title: "Clientes Ativos", 
            value: stats.customersCount, 
            icon: Users, 
            trend: "Compradores únicos", 
            isCurrency: false 
          },
          { 
            title: "Ticket Médio", 
            value: stats.averageTicket, 
            icon: TrendingUp, 
            trend: "Por pedido" 
          }
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.isCurrency !== false ? formatCurrency(stat.value) : stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Sales */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vendas Recentes</CardTitle>
            <Link to="/dashboard/orders">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver tudo <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma venda registrada ainda.
              </div>
            ) : (
              <div className="space-y-6">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-sm">
                        {sale.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sale.customer_name}</p>
                        <p className="text-xs text-gray-500">{sale.customer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(sale.total_amount)}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {sale.status === 'pending' ? 'Pendente' : 
                         sale.status === 'paid' ? 'Pago' : sale.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Setup Checklist */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Configuração da Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  label: "Adicionar primeiro produto", 
                  done: checklist.hasProducts,
                  action: "/dashboard/products/new",
                  btnText: "Adicionar"
                },
                { 
                  label: "Personalizar tema da loja", 
                  done: checklist.hasCustomization,
                  action: "/dashboard/store",
                  btnText: "Personalizar"
                },
                { 
                  label: "Realizar primeira venda", 
                  done: checklist.hasOrders,
                  action: `/s/${store?.slug}`,
                  btnText: "Visitar Loja"
                },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0",
                    task.done ? "bg-green-500 border-green-500 text-white" : "border-gray-300"
                  )}>
                    {task.done && <CheckCircle className="h-3 w-3" />}
                  </div>
                  <span className={cn("text-sm flex-1", task.done ? "text-gray-500 line-through" : "text-gray-900 font-medium")}>
                    {task.label}
                  </span>
                  {!task.done && (
                    <Link to={task.action}>
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        {task.btnText}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
              
              {Object.values(checklist).every(Boolean) && (
                <div className="mt-4 p-3 bg-green-50 text-green-800 text-sm rounded-md text-center font-medium">
                  🎉 Parabéns! Sua loja está configurada e vendendo!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
