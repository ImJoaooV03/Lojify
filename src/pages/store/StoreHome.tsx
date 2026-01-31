import { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { supabase, type Store, type Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { Loader2 } from 'lucide-react';

// Templates
import { ClassicTemplate } from '../../components/store/templates/ClassicTemplate';
import { MinimalTemplate } from '../../components/store/templates/MinimalTemplate';
import { ModernTemplate } from '../../components/store/templates/ModernTemplate';
import { 
  FashionTemplate, 
  TechTemplate, 
  GourmetTemplate, 
  BeautyTemplate, 
  GamingTemplate, 
  HomeTemplate, 
  SportsTemplate, 
  KidsTemplate, 
  BooksTemplate 
} from '../../components/store/templates/NicheTemplates';

interface Category {
  id: string;
  name: string;
}

export default function StoreHome() {
  const { store } = useOutletContext<{ store: Store }>();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();

  // Preview Logic: Allow overriding template_id via query param
  const previewTemplateId = searchParams.get('preview_template');
  const activeTemplateId = previewTemplateId || store.template_id;

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

  const props = {
    store,
    products,
    categories,
    onAddToCart: addToCart
  };

  if (previewTemplateId) {
    return (
      <div className="relative">
        <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-pulse">
          Modo Preview: {activeTemplateId}
        </div>
        {renderTemplate(activeTemplateId as any, props)}
      </div>
    );
  }

  return renderTemplate(activeTemplateId as any, props);
}

function renderTemplate(templateId: string, props: any) {
  switch (templateId) {
    case 'fashion': return <FashionTemplate {...props} />;
    case 'tech': return <TechTemplate {...props} />;
    case 'gourmet': return <GourmetTemplate {...props} />;
    case 'beauty': return <BeautyTemplate {...props} />;
    case 'gaming': return <GamingTemplate {...props} />;
    case 'home': return <HomeTemplate {...props} />;
    case 'sports': return <SportsTemplate {...props} />;
    case 'kids': return <KidsTemplate {...props} />;
    case 'books': return <BooksTemplate {...props} />;
    case 'minimal': return <MinimalTemplate {...props} />;
    case 'modern': return <ModernTemplate {...props} />;
    case 'classic':
    default:
      return <ClassicTemplate {...props} />;
  }
}
