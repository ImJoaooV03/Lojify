import { Link } from 'react-router-dom';
import { Store, CheckCircle, ArrowRight, ShoppingCart, BarChart, Smartphone, QrCode, Ticket, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
              <Store className="h-8 w-8" />
              <span>Lojify</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-indigo-600">Recursos</a>
              <a href="#pricing" className="hover:text-indigo-600">Planos</a>
              <a href="#testimonials" className="hover:text-indigo-600">Clientes</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button>Criar Loja Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              Sua loja online completa com <span className="text-indigo-600">Pix e Marketing</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              A plataforma SaaS definitiva. Crie cupons, receba via Pix, rastreie pedidos e gerencie seu e-commerce em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8">
                  Começar agora grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12">
                Ver demonstração
              </Button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Teste grátis por 30 dias • Sem cartão de crédito
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tudo que você precisa para vender</h2>
            <p className="mt-4 text-lg text-gray-600">Ferramentas poderosas simplificadas para o seu negócio.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: "Pagamentos via Pix",
                desc: "Receba na hora! Configure sua chave Pix e receba pagamentos instantâneos dos seus clientes."
              },
              {
                icon: Ticket,
                title: "Cupons de Desconto",
                desc: "Crie promoções irresistíveis (ex: PRIMEIRACOMPRA) para aumentar suas vendas."
              },
              {
                icon: Truck,
                title: "Rastreamento de Pedidos",
                desc: "Seus clientes podem acompanhar o status da entrega diretamente na loja, reduzindo o suporte."
              },
              {
                icon: ShoppingCart,
                title: "Loja Personalizável",
                desc: "Escolha suas cores, adicione seu logo e deixe a loja com a cara da sua marca."
              },
              {
                icon: Smartphone,
                title: "Venda no Celular",
                desc: "Sua loja perfeitamente otimizada para compras em dispositivos móveis."
              },
              {
                icon: BarChart,
                title: "Gestão Completa",
                desc: "Controle estoque, pedidos e clientes em um painel intuitivo e poderoso."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Planos que crescem com você</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Inicial",
                price: "R$ 49",
                features: ["50 Produtos", "Pix Integrado", "1 Usuário", "Suporte por Email"]
              },
              {
                name: "Profissional",
                price: "R$ 99",
                popular: true,
                features: ["Produtos Ilimitados", "Cupons de Desconto", "3 Usuários", "Suporte Prioritário", "Domínio Grátis"]
              },
              {
                name: "Enterprise",
                price: "R$ 299",
                features: ["Tudo Ilimitado", "API Aberta", "Gerente de Conta", "Múltiplos estoques", "Personalização Avançada"]
              }
            ].map((plan, i) => (
              <div key={i} className={cn(
                "relative p-8 rounded-2xl border flex flex-col",
                plan.popular 
                  ? "border-indigo-600 shadow-xl scale-105 bg-white z-10" 
                  : "border-gray-200 bg-gray-50"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? "default" : "outline"} className="w-full">
                  Escolher {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-2xl text-white mb-4">
              <Store className="h-8 w-8" />
              <span>Lojify</span>
            </div>
            <p className="text-gray-400 max-w-xs">
              Ajudando empreendedores a transformar sonhos em negócios reais desde 2024.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Recursos</a></li>
              <li><a href="#" className="hover:text-white">Temas</a></li>
              <li><a href="#" className="hover:text-white">Preços</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white">API Docs</a></li>
              <li><a href="#" className="hover:text-white">Status</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
