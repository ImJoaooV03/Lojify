import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ImageUpload } from '../../components/ImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Check if editing
  const { store } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [imageUrl, setImageUrl] = useState('');
  
  // Categories
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });

  useEffect(() => {
    if (store?.id) {
      fetchCategories();
      if (id) {
        fetchProduct();
      } else {
        setFetching(false);
      }
    }
  }, [id, store?.id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('store_id', store!.id)
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Erro ao buscar categorias', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', store!.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          stock: data.stock.toString(),
          category: data.category || ''
        });
        setImageUrl(data.image_url || '');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Produto não encontrado.', type: 'error' });
      navigate('/dashboard/products');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;
    
    setLoading(true);
    
    const productData = {
      store_id: store.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')),
      stock: parseInt(formData.stock),
      category: formData.category,
      image_url: imageUrl,
      active: true,
    };

    try {
      let error;
      
      if (id) {
        // Update
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData);
        error = insertError;
      }

      if (error) throw error;
      
      toast({ 
        title: 'Sucesso', 
        description: `Produto ${id ? 'atualizado' : 'criado'} com sucesso!`, 
        type: 'success' 
      });
      navigate('/dashboard/products');
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao salvar produto.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {id ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <p className="text-gray-500">
            {id ? 'Atualize as informações do item.' : 'Adicione um novo item ao seu catálogo.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Ex: Camiseta Algodão" 
                required 
              />
            </div>

            <ImageUpload 
              label="Foto do Produto" 
              value={imageUrl} 
              onChange={setImageUrl} 
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Preço (R$)</label>
                <Input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={handleChange} 
                  placeholder="0.00" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Estoque</label>
                <Input 
                  name="stock" 
                  type="number" 
                  value={formData.stock} 
                  onChange={handleChange} 
                  placeholder="0" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <Link to="/dashboard/categories" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Gerenciar Categorias
                </Link>
              </div>
              
              {loadingCategories ? (
                <div className="h-9 w-full bg-gray-100 rounded animate-pulse" />
              ) : categories.length > 0 ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  {/* If current category is not in list (legacy), show it */}
                  {formData.category && !categories.find(c => c.name === formData.category) && (
                    <option value={formData.category}>{formData.category} (Legado)</option>
                  )}
                </select>
              ) : (
                <div className="space-y-2">
                  <Input 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    placeholder="Digite a categoria (ex: Roupas)" 
                  />
                  <p className="text-xs text-gray-500">Dica: Crie categorias padronizadas no menu "Categorias".</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descreva seu produto..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/products')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {id ? 'Atualizar Produto' : 'Salvar Produto'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
