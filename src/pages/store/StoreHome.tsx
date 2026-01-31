import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ShoppingBag, Search } from 'lucide-react';
import { supabase, type Store, type Product } from '../../lib/supabase';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';

interface Category {
  id: string;
  name: string;
}

export default function StoreHome() {
  const { store } = useOutletContext<{ store: Store }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      if (!store) return;
      try {
        // OTIMIZAÇÃO: Promise.all para buscar produtos e categorias ao mesmo tempo
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory 
      ? p.category === selectedCategory 
      : true;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero / Banner Area */}
      {store.banner_url ? (
        <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-md mb-8 relative group">
          <img 
            src={store.banner_url} 
            alt={store.name} 
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 shadow-sm">{store.name}</h1>
            <p className="text-white/90 text-lg max-w-2xl shadow-sm">
              {store.description || 'Bem-vindo à nossa loja oficial.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{store.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {store.description || 'Bem-vindo à nossa loja oficial. Confira nossos melhores produtos abaixo.'}
          </p>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="sticky top-20 z-20 bg-gray-50/95 backdrop-blur-sm py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative w-full shadow-sm rounded-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="O que você está procurando?" 
              className="pl-10 h-12 rounded-full border-gray-200 focus:ring-indigo-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories Pills */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  selectedCategory === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                    selectedCategory === cat.name
                      ? "text-white border-transparent"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  style={selectedCategory === cat.name ? { backgroundColor: store.primary_color || '#4f46e5' } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mt-1">
            {selectedCategory 
              ? `Não há produtos na categoria "${selectedCategory}".`
              : "Tente buscar por outro termo ou volte mais tarde."}
          </p>
          {selectedCategory && (
            <Button variant="outline" className="mt-4" onClick={() => setSelectedCategory(null)}>
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <Link to={`/s/${store.slug}/p/${product.id}`} className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-3 py-1 text-sm font-bold rounded-full">
                      Esgotado
                    </span>
                  </div>
                )}
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <Link to={`/s/${store.slug}/p/${product.id}`}>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                </div>
                
                <div className="mt-auto flex items-center justify-between gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </span>
                  <Button 
                    size="sm" 
                    className="rounded-full"
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    style={{ backgroundColor: store.primary_color || undefined }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Comprar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
