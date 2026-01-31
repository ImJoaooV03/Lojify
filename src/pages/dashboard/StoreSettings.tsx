import { useState, useEffect } from 'react';
import { Save, Loader2, Store, Palette, Phone, FileText, CreditCard, Truck, LayoutTemplate, Check, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ImageUpload } from '../../components/ImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../lib/utils';
import { TEMPLATES } from '../../data/templates';
import { Modal } from '../../components/ui/Modal';

export default function StoreSettings() {
  const { store, refreshStore } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // States
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    if (store) {
      setLogoUrl(store.logo_url || '');
      setBannerUrl(store.banner_url || '');
      setPrimaryColor(store.primary_color || '#4f46e5');
      setSelectedTemplate(store.template_id || 'classic');
    }
  }, [store]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
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
      template_id: selectedTemplate
    };

    try {
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id);

      if (error) throw error;
      
      await refreshStore();
      toast({ title: 'Sucesso', description: 'Loja atualizada com sucesso!', type: 'success' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Erro ao salvar configurações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (templateId: string) => {
    window.open(`/s/${store?.slug}?preview_template=${templateId}`, '_blank');
  };

  if (!store) return null;

  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Minha Loja</h2>
        <p className="text-gray-500">Personalize a aparência, templates e informações.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* THEME STORE CARD */}
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 relative z-10">
              <LayoutTemplate className="h-5 w-5" />
              Tema Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-100">
                  {currentTemplate.icon ? <currentTemplate.icon className="h-8 w-8" /> : <LayoutTemplate className="h-8 w-8" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{currentTemplate.name || 'Clássico'}</h3>
                  <p className="text-sm text-gray-500">{currentTemplate.description || 'Layout padrão.'}</p>
                </div>
              </div>
              <Button type="button" onClick={() => setIsThemeModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
                Explorar Loja de Temas
              </Button>
            </div>
          </CardContent>
        </Card>

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
                label="Banner Hero (Capa da Loja)" 
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

        <div className="flex justify-end sticky bottom-4 z-10">
          <Button type="submit" size="lg" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 shadow-xl">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Tudo
          </Button>
        </div>
      </form>

      {/* THEME STORE MODAL */}
      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title="Loja de Temas"
        className="max-w-5xl h-[80vh] flex flex-col"
      >
        <div className="flex-1 overflow-y-auto p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className={cn(
                  "group relative rounded-xl border-2 transition-all hover:shadow-lg overflow-hidden flex flex-col",
                  selectedTemplate === template.id 
                    ? "border-indigo-600 ring-2 ring-indigo-100" 
                    : "border-gray-200 hover:border-indigo-300"
                )}
              >
                {/* Header Color Preview */}
                <div 
                  className="h-32 w-full flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${template.colors[0]} 0%, ${template.colors[1]} 100%)` }}
                >
                  <template.icon className="h-12 w-12 text-white/50" />
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 bg-white text-indigo-600 px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center gap-1">
                      <Check className="h-3 w-3" /> Ativo
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4 leading-relaxed flex-1">
                    {template.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.features.map((feat, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handlePreview(template.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button 
                      type="button" 
                      className={cn(
                        "flex-1",
                        selectedTemplate === template.id ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setIsThemeModalOpen(false);
                        toast({ title: 'Tema Selecionado', description: 'Clique em Salvar Tudo para aplicar.', type: 'info' });
                      }}
                    >
                      {selectedTemplate === template.id ? 'Selecionado' : 'Usar Tema'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <Button variant="outline" onClick={() => setIsThemeModalOpen(false)}>Fechar</Button>
        </div>
      </Modal>
    </div>
  );
}
