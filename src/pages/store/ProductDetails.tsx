import { useEffect, useState } from 'react';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, Star, Loader2, Share2, Heart } from 'lucide-react';
import { supabase, type Store, type Product, type Review } from '../../lib/supabase';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';
import { SEO } from '../../components/SEO';
import { ProductCard } from '../../components/store/ProductCard';

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const { store } = useOutletContext<{ store: Store }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProductData() {
      if (!productId) return;
      setLoading(true);
      try {
        // 1. Fetch main product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // 2. Fetch reviews and related products in parallel
        const [reviewsRes, relatedRes] = await Promise.all([
          supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false }),
          
          // Fetch related products (same category, excluding current)
          productData.category ? 
            supabase
              .from('products')
              .select('*')
              .eq('store_id', store.id)
              .eq('category', productData.category)
              .neq('id', productId)
              .limit(4) 
            : Promise.resolve({ data: [] })
        ]);

        if (reviewsRes.data) setReviews(reviewsRes.data);
        if (relatedRes.data) setRelatedProducts(relatedRes.data as Product[]);

      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
    window.scrollTo(0, 0);
  }, [productId, store.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !store) return;
    
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        store_id: store.id,
        product_id: productId,
        customer_name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment
      });

      if (error) throw error;

      setNewReview({ name: '', rating: 5, comment: '' });
      
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
        
      if (data) setReviews(data);
      alert('Avaliação enviada com sucesso!');
    } catch (err) {
      alert('Erro ao enviar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gray-200 rounded-3xl aspect-[4/5]"></div>
          <div className="space-y-6 pt-8">
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Produto não encontrado</div>;

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const primaryColor = store.primary_color || '#4f46e5';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 animate-in fade-in duration-500">
      <SEO 
        title={product.name} 
        description={product.description || `Compre ${product.name}`}
        image={product.image_url || undefined}
        storeName={store.name}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to={`/s/${store.slug}`} className="hover:text-indigo-600">Início</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="relative group">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden aspect-[4/5] shadow-sm relative z-10">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                <ShoppingBag className="h-32 w-32" />
              </div>
            )}
            
            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Passe o mouse para ampliar
            </div>
          </div>
          {/* Decorative Blob */}
          <div className="absolute -top-10 -left-10 w-full h-full bg-indigo-50 rounded-3xl -z-0 transform -rotate-3 scale-105 opacity-50"></div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-4">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold tracking-wide uppercase mb-4">
              {product.category || 'Geral'}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
            
            {/* Rating & Share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn("h-5 w-5", i < Math.round(Number(averageRating || 0)) ? "fill-current" : "text-gray-300")} 
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-500 underline decoration-gray-300 underline-offset-4">
                  {reviews.length > 0 ? `${reviews.length} avaliações` : 'Sem avaliações'}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full mb-8"></div>

          <div className="mb-8">
            <div className="flex items-end gap-4 mb-2">
              <span className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(product.price)}
              </span>
              {/* Mock Original Price */}
              <span className="text-lg text-gray-400 line-through mb-1.5">
                {formatCurrency(product.price * 1.2)}
              </span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md mb-2">
                20% OFF
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Em até 12x de {formatCurrency(product.price / 12)} no cartão
            </p>
          </div>

          <div className="prose prose-gray mb-10 text-gray-600 leading-relaxed">
            <p>{product.description || "Este produto foi cuidadosamente selecionado para oferecer a melhor qualidade e experiência."}</p>
          </div>

          <div className="space-y-6 mb-10">
            <Button 
              size="lg" 
              className="w-full h-16 text-lg font-bold rounded-xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="mr-2 h-6 w-6" />
              {product.stock > 0 ? 'Adicionar à Sacola' : 'Esgotado'}
            </Button>
            
            {product.stock > 0 && product.stock < 10 && (
              <p className="text-center text-sm font-medium text-orange-600 animate-pulse">
                Corra! Apenas {product.stock} unidades em estoque.
              </p>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Entrega Rápida</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {store.shipping_cost ? `Frete fixo de ${formatCurrency(store.shipping_cost)}` : 'Enviamos para todo Brasil'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Garantia de 7 dias</h4>
                <p className="text-xs text-gray-500 mt-1">Satisfação garantida ou seu dinheiro de volta.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Você também pode gostar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((related) => (
              <ProductCard 
                key={related.id} 
                product={related} 
                storeSlug={store.slug}
                primaryColor={primaryColor}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Avaliações</h2>
            <div className="flex items-center gap-4 mb-2">
              <span className="text-5xl font-black text-gray-900">{averageRating || '0.0'}</span>
              <div className="flex flex-col">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn("h-5 w-5", i < Math.round(Number(averageRating || 0)) ? "fill-current" : "text-gray-300")} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{reviews.length} opiniões</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-8">
              Confira o que outros clientes acharam deste produto.
            </p>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Avaliar Produto</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <Input 
                  value={newReview.name}
                  onChange={e => setNewReview({...newReview, name: e.target.value})}
                  placeholder="Seu nome"
                  required
                  className="bg-gray-50 border-gray-200"
                />
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({...newReview, rating: star})}
                      className="focus:outline-none transition-transform active:scale-110"
                    >
                      <Star 
                        className={cn(
                          "h-8 w-8", 
                          star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-200"
                        )} 
                      />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="Escreva sua opinião..."
                  required
                />
                <Button type="submit" className="w-full rounded-xl" disabled={submittingReview} style={{ backgroundColor: primaryColor }}>
                  {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Avaliação
                </Button>
              </form>
            </div>
          </div>

          <div className="md:w-2/3 space-y-6">
            {reviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400">
                <Star className="h-12 w-12 mb-4 opacity-20" />
                <p>Ainda não há avaliações. Seja o primeiro!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.customer_name}</p>
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-gray-200")} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-14">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
