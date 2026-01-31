import { useState, useEffect } from 'react';
import { Star, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { supabase, type Review } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../lib/utils';

interface ReviewWithProduct extends Review {
  products: {
    name: string;
    image_url: string | null;
  } | null;
}

export default function Reviews() {
  const { store } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store?.id) {
      fetchReviews();
    }
  }, [store?.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .eq('store_id', store!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro', description: 'Erro ao carregar avaliações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;

      setReviews(reviews.filter(r => r.id !== id));
      toast({ title: 'Removido', description: 'Avaliação excluída.', type: 'success' });
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro ao excluir avaliação.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Moderação de Avaliações</h2>
        <p className="text-gray-500">Gerencie o feedback dos seus clientes.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma avaliação</h3>
              <p className="text-gray-500 mt-1">Seus produtos ainda não receberam avaliações.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white">
                  {/* Product Image */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                    {review.products?.image_url ? (
                      <img src={review.products.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 truncate">{review.products?.name || 'Produto desconhecido'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn("h-3 w-3", i < review.rating ? "fill-current" : "text-gray-300")} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">por {review.customer_name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.comment}</p>
                  </div>

                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(review.id)}
                      title="Excluir Avaliação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
