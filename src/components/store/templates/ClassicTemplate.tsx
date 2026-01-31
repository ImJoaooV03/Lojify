import { useState } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Store, Product } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ProductCard } from '../ProductCard';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: { id: string; name: string }[];
  onAddToCart: (product: Product) => void;
}

export function ClassicTemplate({ store, products, categories, onAddToCart }: TemplateProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section Clássica */}
      <div className="relative w-full">
        {store.banner_url ? (
          <div className="relative w-full h-[400px] lg:h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img 
              src={store.banner_url} 
              alt={store.name} 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 shadow-sm">
                {store.name}
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-8">
                {store.description || 'Confira nossas ofertas imperdíveis.'}
              </p>
              <Button 
                size="lg" 
                className="rounded-full font-bold"
                style={{ backgroundColor: store.primary_color || undefined }}
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Produtos <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 text-white py-20 text-center">
            <h1 className="text-4xl font-bold mb-4">{store.name}</h1>
            <p className="text-gray-300">{store.description}</p>
          </div>
        )}
      </div>

      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra de Filtros Clássica */}
        <div className="sticky top-20 z-30 mb-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Buscar produtos..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {categories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedCategory === null ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn(
                      "whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      selectedCategory === cat.name ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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

        {/* Grid de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-xl">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                storeSlug={store.slug}
                primaryColor={store.primary_color || undefined}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
