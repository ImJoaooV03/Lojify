import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Product } from '../../lib/supabase';

interface ProductCardProps {
  product: Product;
  storeSlug: string;
  primaryColor?: string;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, storeSlug, primaryColor, onAddToCart }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
    >
      <Link to={`/s/${storeSlug}/p/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">
            <ShoppingBag className="h-12 w-12 opacity-20" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock <= 0 && (
            <span className="bg-gray-900/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
              Esgotado
            </span>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
              Últimas Unidades
            </span>
          )}
        </div>

        {/* Quick Add Button (Desktop Hover) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <Button 
            className="w-full shadow-lg font-semibold"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            disabled={product.stock <= 0}
            style={{ backgroundColor: primaryColor || undefined }}
          >
            {product.stock > 0 ? 'Adicionar à Sacola' : 'Indisponível'}
          </Button>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{product.category || 'Geral'}</p>
          <Link to={`/s/${storeSlug}/p/${product.id}`}>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-lg leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        {/* Placeholder for Rating (Simulated since we don't have avg rating in product table yet) */}
        <div className="flex items-center gap-1 mt-2 mb-3">
          <div className="flex text-yellow-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current" />
            <Star className="h-3.5 w-3.5 fill-current text-gray-200" />
          </div>
          <span className="text-xs text-gray-400">(4.0)</span>
        </div>
        
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through">
              {/* Fake "original price" logic just for visuals if we wanted */}
            </span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Mobile Add Button */}
          <Button 
            size="icon" 
            className="rounded-full md:hidden shadow-sm"
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            style={{ backgroundColor: primaryColor || undefined }}
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
