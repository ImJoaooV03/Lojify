import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

export default function SuperAdminStores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_admin_stores');
      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error('Erro ao buscar lojas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.owner_name && s.owner_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.owner_email && s.owner_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gerenciamento de Lojas</h2>
          <p className="text-slate-500">Controle total sobre os tenants da plataforma.</p>
        </div>
        <Button variant="outline" onClick={fetchStores}>
          Atualizar Lista
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Buscar por loja, dono ou email..." 
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
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Loja</th>
                    <th className="px-4 py-3">Proprietário</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Receita (Total)</th>
                    <th className="px-4 py-3 text-right">Criada em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{store.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-900">{store.owner_name || 'N/A'}</span>
                          <span className="text-xs text-slate-500">{store.owner_email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
                          Ativa
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(store.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {new Date(store.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                  {filteredStores.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma loja encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
