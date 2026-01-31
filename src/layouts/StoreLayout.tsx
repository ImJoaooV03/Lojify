import { useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, Trash2, Store, Phone } from 'lucide-react';
import { supabase, type Store as StoreType } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../lib/utils';
import { SEO } from '../components/SEO';

export default function StoreLayout() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    cartCount 
  } = useCart();

  useEffect(() => {
    async function fetchStore() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setStore(data);
      } catch (err) {
        console.error('Error fetching store:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Store className="h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Loja não encontrada</h1>
        <p className="text-gray-500 mt-2">O endereço que você acessou não existe.</p>
        <Link to="/" className="mt-6">
          <Button variant="outline">Voltar para Lojify</Button>
        </Link>
      </div>
    );
  }

  const primaryColor = store.primary_color || '#4f46e5';

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Default SEO for the store */}
      <SEO 
        title={store.name} 
        description={store.description || `Bem-vindo à ${store.name}. Confira nossos produtos!`}
        image={store.logo_url || undefined}
        storeName={store.name}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to={`/s/${slug}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-10 w-auto object-contain max-w-[150px]" />
            ) : (
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
            )}
            <span className="font-bold text-xl text-gray-900">{store.name}</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to={`/s/${slug}/track`} className="text-sm font-medium text-gray-600 hover:text-indigo-600 hidden sm:block">
              Rastrear Pedido
            </Link>
            <button 
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span 
                  className="absolute top-0 right-0 h-5 w-5 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ store }} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{store.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                {store.description || 'Sua melhor opção para compras online com segurança e qualidade.'}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {store.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {store.phone}
                  </li>
                )}
                <li>
                  <Link to={`/s/${slug}/track`} className="hover:text-indigo-600">
                    Rastrear meu Pedido
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Pagamento Seguro</h4>
              <div className="flex gap-2">
                <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">PIX</div>
                <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-500">CARD</div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            Powered by Lojify Platform
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Seu Carrinho</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Seu carrinho está vazio</p>
                      <p className="text-sm text-gray-500 mt-1">Adicione produtos para começar.</p>
                    </div>
                    <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                      Continuar Comprando
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {items.map((item) => (
                      <li key={item.product.id} className="flex py-2">
                         <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="line-clamp-2">{item.product.name}</h3>
                              <p className="ml-4">{formatCurrency(item.product.price * item.quantity)}</p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 font-medium text-gray-900 min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="font-medium text-red-600 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{formatCurrency(cartTotal)}</p>
                  </div>
                  <Link to={`/s/${slug}/checkout`}>
                    <Button 
                      className="w-full h-12 text-lg hover:opacity-90 transition-opacity text-white"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => setIsCartOpen(false)}
                    >
                      Finalizar Compra
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
