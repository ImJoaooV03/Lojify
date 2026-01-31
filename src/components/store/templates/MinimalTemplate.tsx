import { useState } from 'react';
import { Store, Product } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';
import { ProductCard } from '../ProductCard';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: { id: string; name: string }[];
  onAddToCart: (product: Product) => void;
}

export function MinimalTemplate({ store, products, categories, onAddToCart }: TemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter(p => 
    selectedCategory ? p.category === selectedCategory : true
  );

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      {/* Header Minimalista: Sem banner gigante, foco na tipografia */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-gray-900 mb-6">
          {store.name.toLowerCase()}.
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto font-light text-lg">
          {store.description}
        </p>
      </div>

      {/* Categorias como Texto Simples */}
      {categories.length > 0 && (
        <div className="flex justify-center flex-wrap gap-8 mb-16 border-b border-gray-100 pb-8 mx-auto max-w-4xl px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "text-sm uppercase tracking-widest transition-colors hover:text-black",
              selectedCategory === null ? "text-black font-bold border-b-2 border-black" : "text-gray-400"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "text-sm uppercase tracking-widest transition-colors hover:text-black",
                selectedCategory === cat.name ? "text-black font-bold border-b-2 border-black" : "text-gray-400"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid Limpo */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
               {/* Card Customizado para o tema Minimal */}
               <ProductCard 
                product={product} 
                storeSlug={store.slug}
                primaryColor="black" // Força preto no minimal
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
