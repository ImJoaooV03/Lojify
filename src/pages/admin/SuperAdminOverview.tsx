import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, Store, Users, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

export default function SuperAdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_revenue: 0,
    active_stores: 0,
    total_users: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_admin_overview');
        if (error) throw error;
        setStats(data);
      } catch (err) {
        console.error('Erro ao buscar estatísticas do admin:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Mock data for charts (still mock because we don't have historical data series yet)
  const growthData = [
    { name: 'Jan', stores: 4, revenue: 2400 },
    { name: 'Fev', stores: 10, revenue: 4500 },
    { name: 'Mar', stores: 18, revenue: 7800 },
    { name: 'Abr', stores: 25, revenue: 12000 },
    { name: 'Mai', stores: 35, revenue: 18500 },
    { name: 'Jun', stores: 48, revenue: 25000 },
  ];

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visão Global da Plataforma</h2>
        <p className="text-slate-500">Métricas em tempo real de todo o ecossistema Lojify.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Receita Total (GMV)", 
            value: stats.total_revenue, 
            icon: DollarSign, 
            trend: "Acumulado",
            color: "text-green-600"
          },
          { 
            title: "MRR (Estimado)", 
            value: stats.active_stores * 49.90, // Estimativa baseada em plano básico
            icon: Activity, 
            trend: "Baseado em assinaturas",
            color: "text-indigo-600"
          },
          { 
            title: "Lojas Ativas", 
            value: stats.active_stores, 
            icon: Store, 
            trend: "Total cadastrado",
            isCurrency: false,
            color: "text-blue-600"
          },
          { 
            title: "Total de Usuários", 
            value: stats.total_users, 
            icon: Users, 
            trend: "Cadastrados",
            isCurrency: false,
            color: "text-orange-600"
          }
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stat.isCurrency !== false ? formatCurrency(stat.value) : stat.value}
              </div>
              <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Revenue Growth Chart */}
        <Card className="col-span-4 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Crescimento de Receita (Simulado)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value: number) => [`R$ ${value}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* New Stores Chart */}
        <Card className="col-span-3 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Novas Lojas (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="stores" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
