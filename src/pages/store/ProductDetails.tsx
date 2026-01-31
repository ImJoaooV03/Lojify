import { useEffect, useState } from 'react';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Star, Send, Loader2 } from 'lucide-react';
import { supabase, type Store, type Product, type Review } from '../../lib/supabase';
import { formatCurrency, cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';
import { SEO } from '../../components/SEO';

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const { store } = useOutletContext<{ store: Store }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProductAndReviews() {
      if (!productId) return;
      try {
        // OTIMIZAÇÃO: Promise.all para buscar produto e reviews em paralelo
        const [productRes, reviewsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single(),
          
          supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })
        ]);

        if (productRes.error) throw productRes.error;
        setProduct(productRes.data);
        
        if (reviewsRes.data) {
          setReviews(reviewsRes.data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndReviews();
  }, [productId]);

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
      
      // Refresh reviews only
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
      <div className="animate-pulse max-w-6xl mx-auto">
        <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-gray-200 rounded-2xl aspect-square"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div>Produto não encontrado</div>;

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-300">
      {/* Product Specific SEO */}
      <SEO 
        title={product.name} 
        description={product.description || `Compre ${product.name} por ${formatCurrency(product.price)}`}
        image={product.image_url || undefined}
        storeName={store.name}
      />

      <div>
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 hover:bg-transparent hover:text-indigo-600"
          onClick={() => navigate(`/s/${store.slug}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a loja
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="h-32 w-32 text-gray-200" />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <span className="text-sm font-medium text-indigo-600 mb-2">{product.category}</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn("h-5 w-5", i < Math.round(Number(averageRating || 0)) ? "fill-current" : "text-gray-300")} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {reviews.length > 0 ? `${averageRating} (${reviews.length} avaliações)` : 'Sem avaliações'}
              </span>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-8">
              {formatCurrency(product.price)}
            </div>

            <div className="prose prose-gray mb-8 text-gray-600">
              <p>{product.description || "Sem descrição disponível para este produto."}</p>
            </div>

            <div className="space-y-4 mb-8">
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                style={{ backgroundColor: store.primary_color || undefined }}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Estoque disponível: {product.stock} unidades
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900">Entrega Garantida</h4>
                  <p className="text-sm text-gray-500">
                    {store.shipping_cost ? `Frete fixo de ${formatCurrency(store.shipping_cost)}` : 'Frete calculado no checkout'}
                    {store.free_shipping_threshold && <span className="block text-green-600">Grátis acima de {formatCurrency(store.free_shipping_threshold)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900">Compra Segura</h4>
                  <p className="text-sm text-gray-500">Seus dados protegidos com criptografia.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Avaliações dos Clientes</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* Review Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Deixe sua avaliação</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Seu Nome</label>
                  <Input 
                    value={newReview.name}
                    onChange={e => setNewReview({...newReview, name: e.target.value})}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Nota</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none transition-transform active:scale-90"
                      >
                        <Star 
                          className={cn(
                            "h-8 w-8", 
                            star <= newReview.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Comentário</label>
                  <textarea 
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 mt-1"
                    placeholder="O que você achou do produto?"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submittingReview}>
                  {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Avaliação
                </Button>
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Seja o primeiro a avaliar este produto!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.customer_name}</p>
                        <div className="flex text-yellow-400 text-xs">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-gray-300")} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-600 pl-14">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
