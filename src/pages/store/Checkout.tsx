import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Loader2, Lock, MapPin, CreditCard, ArrowLeft, Check, AlertCircle, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/utils';
import { supabase, type Store } from '../../lib/supabase';

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { store } = useOutletContext<{ store: Store }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Seu carrinho está vazio</h2>
        <Button variant="link" onClick={() => navigate(`/s/${store.slug}`)}>
          Voltar para a loja
        </Button>
      </div>
    );
  }

  // --- Shipping Logic ---
  const isFreeShipping = store.free_shipping_threshold && cartTotal >= store.free_shipping_threshold;
  const shippingCost = isFreeShipping ? 0 : (store.shipping_cost || 0);

  // --- Total Logic ---
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);
    setCouponError(null);

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', store.id)
        .eq('code', couponCode.toUpperCase().trim())
        .eq('active', true)
        .single();

      if (error || !data) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discount: data.discount_percentage
        });
        setCouponError(null);
      }
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon 
    ? (cartTotal * appliedCoupon.discount) / 100 
    : 0;
  
  const finalTotal = cartTotal - discountAmount + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // 1. Criar o Pedido
      const orderData = {
        store_id: store.id,
        customer_name: formData.get('fullName'),
        customer_email: formData.get('email'),
        customer_phone: formData.get('phone'),
        address_line1: formData.get('address'),
        address_line2: formData.get('complement'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip'),
        total_amount: finalTotal,
        discount_amount: discountAmount,
        shipping_amount: shippingCost,
        coupon_code: appliedCoupon?.code || null,
        payment_method: formData.get('paymentMethod'),
        status: 'pending'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Criar os Itens do Pedido (AGORA COM VARIANTES!)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        selected_options: item.selectedOptions || null // Salva as opções escolhidas
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Limpar carrinho e redirecionar
      clearCart();
      navigate(`/s/${store.slug}/success`, { 
        state: { 
          orderId: order.id,
          paymentMethod: orderData.payment_method
        } 
      });

    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert('Ocorreu um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
        onClick={() => navigate(`/s/${store.slug}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a loja
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="md:col-span-2 space-y-6">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-indigo-600" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                  <Input name="fullName" required placeholder="Ex: Maria Silva" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <Input name="email" type="email" required placeholder="maria@email.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">WhatsApp / Telefone</label>
                    <Input name="phone" required placeholder="(11) 99999-9999" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2">
                    <label className="text-sm font-medium text-gray-700">CEP</label>
                    <Input name="zip" required placeholder="00000-000" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Endereço</label>
                    <Input name="address" required placeholder="Rua, Número" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cidade</label>
                    <Input name="city" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <Input name="state" required maxLength={2} placeholder="UF" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Complemento (Opcional)</label>
                  <Input name="complement" placeholder="Apto, Bloco, Ponto de referência" />
                </div>
              </CardContent>
            </Card>

            {/* Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {store.pix_key ? (
                    <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 border-indigo-200 bg-indigo-50/50">
                      <input type="radio" name="paymentMethod" value="pix" id="pix" defaultChecked className="h-4 w-4 text-indigo-600" />
                      <label htmlFor="pix" className="flex-1 font-medium text-gray-900 cursor-pointer">
                        Pix (Aprovação Imediata)
                        <span className="block text-xs text-gray-500 font-normal">Pague usando o QR Code ou Copia e Cola</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                      <AlertCircle className="h-4 w-4" />
                      Esta loja ainda não configurou o pagamento via Pix.
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value="card" id="card" defaultChecked={!store.pix_key} className="h-4 w-4 text-indigo-600" />
                    <label htmlFor="card" className="flex-1 font-medium text-gray-900 cursor-pointer">
                      Cartão de Crédito
                      <span className="block text-xs text-gray-500 font-normal">Pagamento seguro via Stripe/Pagar.me</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Resumo do Pedido */}
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}-${idx}`} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded bg-cover bg-center" style={{ backgroundImage: `url(${item.product.image_url})` }}></div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                        {/* Exibir opções selecionadas */}
                        {item.selectedOptions && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {Object.entries(item.selectedOptions).map(([key, val]) => (
                              <span key={key} className="mr-2">{key}: {val}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              
              {/* Cupom */}
              <div className="pt-4 border-t">
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Código" 
                    className="uppercase"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button type="button" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                      Remover
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={verifyingCoupon || !couponCode}>
                      {verifyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Cupom {appliedCoupon.code} aplicado: {appliedCoupon.discount}% OFF
                  </p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Frete
                  </span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">Grátis</span>
                  ) : (
                    <span className="font-medium">{formatCurrency(shippingCost)}</span>
                  )}
                </div>
                {store.free_shipping_threshold && shippingCost > 0 && (
                  <p className="text-xs text-indigo-600 text-right">
                    Faltam {formatCurrency(store.free_shipping_threshold - cartTotal)} para frete grátis!
                  </p>
                )}

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Confirmar Pedido
              </Button>
              
              <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Ambiente 100% Seguro
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
