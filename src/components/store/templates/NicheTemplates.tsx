import { Store, Product } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/utils';
import { Search, ShoppingBag, Heart, Plus, Smartphone, Gamepad2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { useNavigate } from 'react-router-dom';

interface TemplateProps {
  store: Store;
  products: Product[];
  categories: { id: string; name: string }[];
  onAddToCart: (product: Product) => void;
}

// --- 1. FASHION TEMPLATE ---
export function FashionTemplate({ store, products }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-white font-serif min-h-screen">
      {/* Hero Editorial */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">IMAGEM EDITORIAL</div>
        )}
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-6xl md:text-8xl text-white font-thin tracking-tighter mb-4 italic">
            {store.name}
          </h1>
          <Button 
            className="bg-white text-black hover:bg-stone-100 rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold"
            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Coleção
          </Button>
        </div>
      </div>

      <div id="collection" className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map(product => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-stone-100">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <button 
                  onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}
                  className="absolute bottom-0 left-0 w-full bg-white/90 py-4 text-xs uppercase tracking-widest font-bold translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                >
                  Visualizar
                </button>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm font-bold">{formatCurrency(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 2. TECH TEMPLATE ---
export function TechTemplate({ store, products }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-50 font-sans min-h-screen">
      <div className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
            <p className="text-slate-400">{store.description}</p>
          </div>
          <div className="w-full md:w-96 relative">
            <Input placeholder="Buscar produtos..." className="bg-slate-800 border-slate-700 text-white" />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-slate-100 rounded mb-4 flex items-center justify-center p-4">
                {product.image_url ? (
                  <img src={product.image_url} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                ) : <Smartphone className="h-12 w-12 text-slate-300" />}
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {product.category || 'Tech'}
                </span>
                <h3 className="font-bold text-slate-900 leading-tight h-10 line-clamp-2">{product.name}</h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
                  <Button size="sm" onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}>
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. GOURMET TEMPLATE ---
export function GourmetTemplate({ store, products, onAddToCart }: TemplateProps) {
  return (
    <div className="bg-orange-50/30 font-sans min-h-screen">
      <div className="bg-white shadow-sm sticky top-0 z-20 px-4 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-orange-600">{store.name}</h1>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 rounded-full">
            <ShoppingBag className="h-4 w-4 mr-2" /> Pedido
          </Button>
        </div>
      </div>

      {store.banner_url && (
        <div className="h-64 w-full overflow-hidden">
          <img src={store.banner_url} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Cardápio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex gap-4 hover:border-orange-300 transition-colors">
              <div className="h-32 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description || 'Delicioso e preparado na hora.'}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-bold text-lg text-orange-600">{formatCurrency(product.price)}</span>
                  <Button 
                    size="sm" 
                    className="rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 border-0"
                    onClick={() => onAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 4. BEAUTY TEMPLATE ---
export function BeautyTemplate({ store, products }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fffafc] font-sans min-h-screen">
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-serif text-gray-900 mb-4">{store.name}</h1>
        <div className="w-24 h-1 bg-pink-300 mx-auto mb-6"></div>
        <p className="text-gray-500 italic max-w-lg mx-auto">{store.description}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <div key={product.id} className="group text-center">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-md transition-all">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full h-full object-cover" />
                ) : <div className="w-full h-full bg-pink-50" />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <Button 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black hover:bg-pink-50 rounded-full shadow-lg"
                  onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}
                >
                  Ver Detalhes
                </Button>
              </div>
              <h3 className="font-medium text-gray-900 text-lg">{product.name}</h3>
              <p className="text-pink-600 font-serif italic mt-1">{formatCurrency(product.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 5. GAMING TEMPLATE ---
export function GamingTemplate({ store, products }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0a0a0a] text-gray-100 font-sans min-h-screen selection:bg-green-500 selection:text-black">
      <div className="relative border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-purple-900/20"></div>
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10 flex justify-between items-center">
          <h1 className="text-3xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            {store.name.toUpperCase()}
          </h1>
          <div className="flex gap-4">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">Login</Button>
            <Button className="bg-green-600 hover:bg-green-500 text-black font-bold border-0">CART (0)</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-gray-900 border border-gray-800 p-4 hover:border-green-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 z-10">
                <div className="bg-gray-800 text-xs font-bold px-2 py-1 rounded text-green-400 border border-gray-700">
                  {product.category || 'GEAR'}
                </div>
              </div>
              <div className="aspect-video bg-gray-950 mb-4 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : <Gamepad2 className="h-12 w-12 text-gray-700" />}
              </div>
              <h3 className="font-bold text-xl mb-1 truncate">{product.name}</h3>
              <div className="flex justify-between items-end mt-4">
                <span className="text-2xl font-bold text-green-400">{formatCurrency(product.price)}</span>
                <Button 
                  className="bg-gray-800 hover:bg-green-600 hover:text-black transition-colors rounded-none border border-gray-700"
                  onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}
                >
                  BUY NOW
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 6. HOME TEMPLATE ---
export function HomeTemplate({ store, products }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfbf9] font-sans min-h-screen">
      <nav className="flex justify-center py-8">
        <h1 className="text-3xl font-light tracking-wide text-stone-800 border-b border-stone-300 pb-2 px-8">
          {store.name}
        </h1>
      </nav>

      <div className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="columns-1 md:columns-2 lg:columns-4 gap-8 space-y-8">
          {products.map(product => (
            <div key={product.id} className="break-inside-avoid mb-8 group cursor-pointer" onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}>
              <div className="relative rounded-xl overflow-hidden mb-3">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full object-cover" />
                ) : <div className="w-full h-64 bg-stone-100" />}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  <Heart className="h-4 w-4 text-stone-800" />
                </button>
              </div>
              <h3 className="text-stone-900 font-medium text-lg leading-tight">{product.name}</h3>
              <p className="text-stone-500 mt-1">{formatCurrency(product.price)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 7. SPORTS TEMPLATE ---
export function SportsTemplate({ store, products, onAddToCart }: TemplateProps) {
  return (
    <div className="bg-white font-sans min-h-screen">
      <div className="bg-red-600 text-white transform -skew-y-1 origin-top-left pb-12 pt-4 px-4 mb-12">
        <div className="max-w-7xl mx-auto transform skew-y-1">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">
              {store.name}
            </h1>
            <ShoppingBag className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black italic text-gray-900 mb-8 uppercase">Novos Produtos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="border-2 border-gray-100 hover:border-red-600 transition-colors p-6 group">
              <div className="aspect-square bg-gray-50 mb-6 flex items-center justify-center p-4">
                {product.image_url && <img src={product.image_url} className="max-h-full object-contain" />}
              </div>
              <h3 className="font-bold text-xl text-gray-900 uppercase italic mb-2">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black text-red-600 italic">{formatCurrency(product.price)}</span>
                <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-none italic font-bold px-6"
                  onClick={() => onAddToCart(product)}
                >
                  COMPRAR
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 8. KIDS TEMPLATE ---
export function KidsTemplate({ store, products, onAddToCart }: TemplateProps) {
  return (
    <div className="bg-yellow-50 font-sans min-h-screen">
      <header className="bg-white py-6 px-4 border-b-4 border-purple-400 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black text-purple-500 tracking-tight">{store.name}</h1>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-blue-400 rounded-full"></div>
            <div className="h-10 w-10 bg-green-400 rounded-full"></div>
            <div className="h-10 w-10 bg-red-400 rounded-full"></div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] p-4 shadow-[0_8px_0_0_rgba(0,0,0,0.1)] border-2 border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="aspect-square bg-blue-50 rounded-[1.5rem] mb-4 overflow-hidden">
                {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" />}
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2 px-2">{product.name}</h3>
              <div className="flex justify-between items-center px-2 pb-2">
                <span className="font-black text-xl text-purple-500">{formatCurrency(product.price)}</span>
                <Button 
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl shadow-[0_4px_0_0_rgba(202,138,4,1)] active:shadow-none active:translate-y-1 transition-all"
                  onClick={() => onAddToCart(product)}
                >
                  Eu quero!
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 9. BOOKS TEMPLATE ---
export function BooksTemplate({ store, products, onAddToCart }: TemplateProps) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f5f5f4] font-serif min-h-screen text-stone-800">
      <div className="border-b border-stone-300 bg-white py-8 px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">{store.name}</h1>
        <p className="text-stone-500 mt-2 font-sans text-sm uppercase tracking-widest">Livraria & Papelaria</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {products.map(product => (
            <div key={product.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 shadow-sm border border-stone-200">
              <div className="w-full sm:w-32 flex-shrink-0 bg-stone-100 shadow-inner">
                {product.image_url ? (
                  <img src={product.image_url} className="w-full h-auto object-cover shadow-md transform -rotate-1 hover:rotate-0 transition-transform" />
                ) : <div className="h-40 w-full bg-stone-200" />}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{product.name}</h3>
                  <p className="text-stone-600 leading-relaxed text-sm line-clamp-3 mb-4">
                    {product.description || 'Sinopse indisponível.'}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-2">
                  <span className="text-xl font-bold text-stone-900">{formatCurrency(product.price)}</span>
                  <div className="flex gap-3">
                    <Button variant="ghost" className="font-sans text-stone-600" onClick={() => navigate(`/s/${store.slug}/p/${product.id}`)}>Detalhes</Button>
                    <Button 
                      className="bg-stone-800 text-white hover:bg-stone-700 font-sans"
                      onClick={() => onAddToCart(product)}
                    >
                      Comprar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
