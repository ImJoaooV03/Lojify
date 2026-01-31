import { useState, useEffect } from 'react';
import { Plus, Search, Tags, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function Categories() {
  const { store } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (store?.id) {
      fetchCategories();
    }
  }, [store?.id]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('store_id', store!.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro ao carregar categorias.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          store_id: store!.id,
          name: newCategory.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategory("");
      toast({ title: 'Sucesso', description: 'Categoria criada!', type: 'success' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro ao criar categoria.', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza? Produtos nesta categoria não serão excluídos, mas ficarão sem categoria.')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setCategories(categories.filter(c => c.id !== id));
      toast({ title: 'Removido', description: 'Categoria excluída.', type: 'success' });
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao excluir categoria.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Categorias</h2>
        <p className="text-gray-500">Organize seus produtos em departamentos.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <h3 className="font-semibold text-lg">Nova Categoria</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <Input 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex: Calçados"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating || !newCategory.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <Tags className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Sem categorias</h3>
                <p className="text-gray-500 mt-1">Crie categorias para organizar sua loja.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between py-3 group">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
