import { useState, useEffect } from 'react';
import { Save, Loader2, Store, Palette, Phone, FileText, CreditCard, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ImageUpload } from '../../components/ImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function StoreSettings() {
  const { store, refreshStore } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  useEffect(() => {
    if (store) {
      setLogoUrl(store.logo_url || '');
      setBannerUrl(store.banner_url || '');
      setPrimaryColor(store.primary_color || '#4f46e5');
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Parse shipping values
    const shippingCost = formData.get('shipping_cost') ? parseFloat(formData.get('shipping_cost') as string) : 0;
    const freeShippingThreshold = formData.get('free_shipping_threshold') 
      ? parseFloat(formData.get('free_shipping_threshold') as string) 
      : null;

    const updates = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      phone: formData.get('phone') as string,
      pix_key: formData.get('pix_key') as string,
      pix_instructions: formData.get('pix_instructions') as string,
      shipping_cost: shippingCost,
      free_shipping_threshold: freeShippingThreshold,
      primary_color: primaryColor,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    };

    try {
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id);

      if (error) throw error;
      
      await refreshStore();
      toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao salvar configurações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Minha Loja</h2>
        <p className="text-gray-500">Personalize a aparência e informações da sua loja.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidade Visual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Identidade Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <ImageUpload 
                label="Logotipo da Loja (Quadrado)" 
                value={logoUrl} 
                onChange={setLogoUrl} 
              />
              <ImageUpload 
                label="Banner Promocional (Horizontal)" 
                value={bannerUrl} 
                onChange={setBannerUrl} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cor Principal</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 p-1 rounded border border-gray-300 cursor-pointer"
                />
                <Input 
                  value={primaryColor} 
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="max-w-[120px] font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-600" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome da Loja</label>
              <Input name="name" defaultValue={store.name} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Descrição
              </label>
              <textarea 
                name="description"
                defaultValue={store.description || ''}
                className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                placeholder="Uma breve descrição sobre o que sua loja vende..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" /> WhatsApp / Telefone
              </label>
              <Input name="phone" defaultValue={store.phone || ''} placeholder="(00) 00000-0000" />
            </div>
          </CardContent>
        </Card>

        {/* Configuração de Frete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              Configuração de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Custo Fixo de Entrega (R$)</label>
                <Input 
                  name="shipping_cost" 
                  type="number" 
                  step="0.01"
                  defaultValue={store.shipping_cost || 0} 
                  placeholder="0.00" 
                />
                <p className="text-xs text-gray-500">Valor cobrado por pedido.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mínimo para Frete Grátis (R$)</label>
                <Input 
                  name="free_shipping_threshold" 
                  type="number" 
                  step="0.01"
                  defaultValue={store.free_shipping_threshold || ''} 
                  placeholder="Ex: 200.00" 
                />
                <p className="text-xs text-gray-500">Deixe em branco para não oferecer frete grátis.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pagamento Pix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Configuração de Pagamento (Pix)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chave Pix</label>
              <Input 
                name="pix_key" 
                defaultValue={store.pix_key || ''} 
                placeholder="CPF, Email ou Chave Aleatória" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Instruções de Pagamento</label>
              <textarea 
                name="pix_instructions"
                defaultValue={store.pix_instructions || ''}
                className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                placeholder="Ex: Envie o comprovante para nosso WhatsApp..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
