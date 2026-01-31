import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase, type Store, type Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { Loader2 } from 'lucide-react';

// Templates
import { ClassicTemplate } from '../../components/store/templates/ClassicTemplate';
import { MinimalTemplate } from '../../components/store/templates/MinimalTemplate';
import { ModernTemplate } from '../../components/store/templates/ModernTemplate';

interface Category {
  id: string;
  name: string;
}

export default function StoreHome() {
  const { store } = useOutletContext<{ store: Store }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      if (!store) return;
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('store_id', store.id)
            .eq('active', true)
            .order('created_at', { ascending: false }),
          
          supabase
            .from('categories')
            .select('id, name')
            .eq('store_id', store.id)
            .order('name')
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [store]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Renderiza o template baseado na escolha do lojista
  switch (store.template_id) {
    case 'minimal':
      return (
        <MinimalTemplate 
          store={store} 
          products={products} 
          categories={categories} 
          onAddToCart={addToCart} 
        />
      );
    case 'modern':
      return (
        <ModernTemplate 
          store={store} 
          products={products} 
          categories={categories} 
          onAddToCart={addToCart} 
        />
      );
    case 'classic':
    default:
      return (
        <ClassicTemplate 
          store={store} 
          products={products} 
          categories={categories} 
          onAddToCart={addToCart} 
        />
      );
  }
}
