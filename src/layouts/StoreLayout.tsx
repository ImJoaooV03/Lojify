import { useEffect, useState } from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, Store, Phone, Search, Menu, Instagram, Facebook, Twitter, MapPin, Mail } from 'lucide-react';
import { supabase, type Store as StoreType } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { useCart } from '../contexts/CartContext';
import { formatCurrency, cn } from '../lib/utils';
import { SEO } from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoreLayout() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    cartTotal,
    cartCount 
  } = useCart();

  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 animate-pulse">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Store className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Loja não encontrada</h1>
        <p className="text-gray-500 mt-2 mb-8">O endereço que você acessou não existe ou foi desativado.</p>
        <Link to="/">
          <Button variant="outline">Conhecer a Lojify</Button>
        </Link>
      </div>
    );
  }

  const primaryColor = store.primary_color || '#4f46e5';

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <SEO 
        title={store.name} 
        description={store.description || `Bem-vindo à ${store.name}. Confira nossos produtos!`}
        image={store.logo_url || undefined}
        storeName={store.name}
      />

      {/* Announcement Bar */}
      {store.free_shipping_threshold && (
        <div className="bg-gray-900 text-white text-xs font-medium py-2.5 px-4 text-center tracking-wide">
          🎉 Frete Grátis para compras acima de {formatCurrency(store.free_shipping_threshold)}
        </div>
      )}

      {/* Header */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          scrolled ? "bg-white/90 backdrop-blur-md border-gray-200 shadow-sm py-2" : "bg-white border-transparent py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link to={`/s/${slug}`} className="flex items-center gap-3 group">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-10 w-auto object-contain max-w-[140px]" />
              ) : (
                <div className="h-10 w-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Store className="h-5 w-5" />
                </div>
              )}
              <span className={cn("font-bold text-xl tracking-tight text-gray-900", !store.logo_url && "group-hover:text-indigo-600 transition-colors")}>
                {store.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to={`/s/${slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Início</Link>
              <Link to={`/s/${slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Produtos</Link>
              <Link to={`/s/${slug}/track`} className="text-sm font-medium text-gray-600 hover:text-gray-900">Rastrear Pedido</Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <Search className="h-5 w-5" />
              </button>
              
              <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

              <button 
                className="relative p-2 text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="h-6 w-6" />
                {cartCount > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 overflow-hidden bg-white"
            >
              <nav className="flex flex-col p-4 space-y-4">
                <Link to={`/s/${slug}`} className="text-base font-medium text-gray-900">Início</Link>
                <Link to={`/s/${slug}`} className="text-base font-medium text-gray-900">Produtos</Link>
                <Link to={`/s/${slug}/track`} className="text-base font-medium text-gray-900">Rastrear Pedido</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet context={{ store }} />
      </main>

      {/* Footer Profissional */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
                ) : (
                  <Store className="h-6 w-6" />
                )}
                <span>{store.name}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {store.description || 'Sua loja favorita para encontrar os melhores produtos com qualidade e segurança.'}
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Twitter className="h-5 w-5" /></a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Navegação</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to={`/s/${slug}`} className="hover:text-indigo-600 transition-colors">Início</Link></li>
                <li><Link to={`/s/${slug}`} className="hover:text-indigo-600 transition-colors">Todos os Produtos</Link></li>
                <li><Link to={`/s/${slug}/track`} className="hover:text-indigo-600 transition-colors">Rastrear Pedido</Link></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Sobre Nós</a></li>
              </ul>
            </div>

            {/* Atendimento */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Atendimento</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                {store.phone && (
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" /> 
                    <span>{store.phone}</span>
                  </li>
                )}
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>contato@{slug}.com.br</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>Brasil</span>
                </li>
              </ul>
            </div>

            {/* Newsletter (Visual) */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Novidades</h4>
              <p className="text-sm text-gray-500 mb-4">Cadastre-se para receber ofertas exclusivas.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button size="sm" style={{ backgroundColor: primaryColor }}>OK</Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">PIX</div>
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">VISA</div>
                <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">MASTER</div>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <a href="/" target="_blank" className="text-xs font-medium text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                <Store className="h-3 w-3" /> Tecnologia Lojify
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer (Modernizado) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" 
              onClick={() => setIsCartOpen(false)}
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-gray-900" />
                  <h2 className="text-lg font-bold text-gray-900">Sua Sacola ({cartCount})</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">Sua sacola está vazia</p>
                      <p className="text-gray-500 mt-2 max-w-xs mx-auto">Navegue pela loja e adicione produtos incríveis para começar.</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCartOpen(false)}
                      className="border-gray-300 text-gray-700 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
                    >
                      Começar a Comprar
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {items.map((item, index) => (
                      <li key={`${item.product.id}-${index}`} className="flex gap-4 group">
                         <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                              <ShoppingBag className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug">
                                <Link to={`/s/${slug}/p/${item.product.id}`} onClick={() => setIsCartOpen(false)}>
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="font-bold text-gray-900 whitespace-nowrap">
                                {formatCurrency(item.product.price * item.quantity)}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              <p>{item.product.category}</p>
                              {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                                <p key={key} className="text-gray-600 font-medium">
                                  {key}: {value}
                                </p>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-200 rounded-lg h-8">
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedOptions)}
                                className="px-2.5 hover:bg-gray-50 h-full flex items-center text-gray-600 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 font-medium text-gray-900 text-sm min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)}
                                className="px-2.5 hover:bg-gray-50 h-full flex items-center text-gray-600"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id, item.selectedOptions)}
                              className="text-xs font-medium text-red-500 hover:text-red-700 underline decoration-red-200 hover:decoration-red-500 underline-offset-2 transition-all"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>{formatCurrency(cartTotal)}</p>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Frete e descontos calculados no checkout
                    </p>
                  </div>
                  <Link to={`/s/${slug}/checkout`}>
                    <Button 
                      className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white rounded-xl"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => setIsCartOpen(false)}
                    >
                      Finalizar Compra
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
