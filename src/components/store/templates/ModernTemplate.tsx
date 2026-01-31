import { useState } from 'react';
import { Search } from 'lucide-react';
import { Store, Product } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { Button } from '../../ui/Button';
import { ProductCard } from '../ProductCard';
import { Input } from '../../ui/Input';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: { id: string; name: string }[];
  onAddToCart: (product: Product) => void;
}

export function ModernTemplate({ store, products, categories, onAddToCart }: TemplateProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Split Screen */}
      <div className="grid lg:grid-cols-2 min-h-[80vh]">
        <div className="bg-gray-900 text-white flex flex-col justify-center p-12 lg:p-24 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4 block">
              Coleção 2025
            </span>
            <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight">
              {store.name}
            </h1>
            <p className="text-gray-400 text-xl mb-8 max-w-md leading-relaxed">
              {store.description || 'Descubra produtos incríveis com design exclusivo e qualidade superior.'}
            </p>
            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg rounded-none bg-white text-black hover:bg-gray-200 border-0"
                onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Loja
              </Button>
            </div>
          </div>
        </div>
        <div className="relative h-[50vh] lg:h-auto bg-gray-200">
          {store.banner_url ? (
            <img 
              src={store.banner_url} 
              alt="Hero" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white/20 font-black text-9xl rotate-12 select-none">SHOP</span>
            </div>
          )}
        </div>
      </div>

      <div id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Modern Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Produtos</h2>
            <p className="text-gray-500">Selecionados para você</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
               <Input 
                 placeholder="Buscar..." 
                 className="pl-9 bg-white border-gray-200 rounded-none h-10"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-6 py-2 rounded-full border transition-all text-sm font-bold",
                selectedCategory === null 
                  ? "bg-black text-white border-black" 
                  : "bg-transparent text-gray-600 border-gray-300 hover:border-black"
              )}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "px-6 py-2 rounded-full border transition-all text-sm font-bold",
                  selectedCategory === cat.name
                    ? "bg-black text-white border-black" 
                    : "bg-transparent text-gray-600 border-gray-300 hover:border-black"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-300">
              <ProductCard 
                product={product} 
                storeSlug={store.slug}
                primaryColor={store.primary_color || undefined}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
