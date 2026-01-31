import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { supabase, type Store, type Product } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';
import { ProductCard } from '../../components/store/ProductCard';
import { Button } from '../../components/ui/Button';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse mb-12"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      
      {/* Hero Section Imersiva */}
      <div className="relative w-full">
        {store.banner_url ? (
          <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img 
              src={store.banner_url} 
              alt={store.name} 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-[20s]"
              loading="eager"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <span className="text-white/80 uppercase tracking-[0.2em] text-sm font-bold mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                Bem-vindo à {store.name}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight shadow-sm max-w-4xl leading-tight animate-in slide-in-from-bottom-4 duration-700 delay-200">
                {store.description ? store.description.split('.')[0] : 'Qualidade e Estilo para Você'}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8 font-light animate-in slide-in-from-bottom-4 duration-700 delay-300">
                Confira nossa nova coleção e aproveite as melhores ofertas.
              </p>
              <Button 
                size="lg" 
                className="h-14 px-8 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-transform animate-in zoom-in duration-500 delay-500"
                style={{ backgroundColor: store.primary_color || undefined }}
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Produtos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[400px] bg-gray-900 overflow-hidden flex items-center justify-center">
             {/* Pattern Background */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
             <div className="relative z-10 text-center px-4">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                  {store.name}
                </h1>
                <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                  {store.description || 'Os melhores produtos selecionados especialmente para você.'}
                </p>
             </div>
          </div>
        )}
      </div>

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter Bar Sticky */}
        <div className="sticky top-20 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs group">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input 
                placeholder="Buscar produtos..." 
                className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-hide no-scrollbar mask-linear-fade">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                    selectedCategory === null
                      ? "bg-gray-900 text-white shadow-md transform scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                      selectedCategory === cat.name
                        ? "text-white shadow-md transform scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory : 'Destaques'}
              <span className="text-sm font-normal text-gray-500 ml-3">
                {filteredProducts.length} produtos
              </span>
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white shadow-sm mb-6">
                <Filter className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Não encontramos nada com esses filtros. Tente buscar por outro termo.
              </p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  storeSlug={store.slug}
                  primaryColor={store.primary_color || undefined}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
