import { useState, useEffect } from 'react';
import { Plus, Search, Tag, Trash2, Loader2, AlertCircle, Power } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { supabase, type Coupon } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function Coupons() {
  const { store } = useAuth();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: ''
  });

  useEffect(() => {
    if (store?.id) {
      fetchCoupons();
    }
  }, [store?.id]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', store!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro ao carregar cupons.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const code = formData.code.toUpperCase().trim();
      const percentage = parseFloat(formData.discount_percentage);

      if (percentage <= 0 || percentage > 100) {
        throw new Error('A porcentagem deve ser entre 1 e 100.');
      }

      const { data, error } = await supabase
        .from('coupons')
        .insert({
          store_id: store!.id,
          code,
          discount_percentage: percentage,
          active: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Este código de cupom já existe.');
        throw error;
      }

      setCoupons([data, ...coupons]);
      toast({ title: 'Sucesso', description: 'Cupom criado!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ code: '', discount_percentage: '' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !coupon.active })
        .eq('id', coupon.id);

      if (error) throw error;

      setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, active: !c.active } : c));
      toast({ 
        title: 'Atualizado', 
        description: `Cupom ${!coupon.active ? 'ativado' : 'desativado'}.`, 
        type: 'success' 
      });
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao atualizar status.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;

      setCoupons(coupons.filter(c => c.id !== id));
      toast({ title: 'Removido', description: 'Cupom excluído com sucesso.', type: 'success' });
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao excluir cupom.', type: 'error' });
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Cupons de Desconto</h2>
          <p className="text-gray-500">Crie promoções para impulsionar suas vendas.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Buscar código..." 
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
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum cupom criado</h3>
              <p className="text-gray-500 mt-1">Crie seu primeiro cupom para começar.</p>
            </div>
          ) : (
            <div className="rounded-md border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Desconto</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600">{coupon.code}</td>
                      <td className="px-4 py-3">{coupon.discount_percentage}% OFF</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={coupon.active ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
                            onClick={() => toggleStatus(coupon)}
                            title={coupon.active ? "Desativar" : "Ativar"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(coupon.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Cupom de Desconto"
        className="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Código do Cupom</label>
            <Input 
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
              placeholder="Ex: PROMO10"
              required
              className="uppercase font-mono"
            />
            <p className="text-xs text-gray-500">O código será convertido para maiúsculas automaticamente.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Porcentagem de Desconto (%)</label>
            <Input 
              type="number"
              min="1"
              max="100"
              value={formData.discount_percentage}
              onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
              placeholder="Ex: 10"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Cupom
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
