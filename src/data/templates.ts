import { 
  ShoppingBag, 
  Smartphone, 
  Utensils, 
  Sparkles, 
  Gamepad2, 
  Home, 
  Trophy, 
  Baby, 
  BookOpen,
  Layout
} from 'lucide-react';

export const TEMPLATES = [
  {
    id: 'fashion',
    name: 'Fashion Editorial',
    description: 'Design sofisticado com foco em imagens grandes. Ideal para marcas de roupa e acessórios.',
    icon: ShoppingBag,
    colors: ['#000000', '#ffffff'],
    features: ['Hero Fullscreen', 'Tipografia Serifada', 'Layout Clean']
  },
  {
    id: 'tech',
    name: 'Tech Store',
    description: 'Layout em grid denso, focado em especificações e comparação. Perfeito para eletrônicos.',
    icon: Smartphone,
    colors: ['#0f172a', '#3b82f6'],
    features: ['Grid Técnico', 'Cards Detalhados', 'Visual Moderno']
  },
  {
    id: 'gourmet',
    name: 'Gourmet Delivery',
    description: 'Cores quentes e cards apetitosos. Otimizado para restaurantes e delivery de comida.',
    icon: Utensils,
    colors: ['#ea580c', '#fff7ed'],
    features: ['Botão Compra Rápida', 'Fotos Redondas', 'Visual Quente']
  },
  {
    id: 'beauty',
    name: 'Beauty & Care',
    description: 'Estética suave com tons pastéis e tipografia elegante. Para cosméticos e bem-estar.',
    icon: Sparkles,
    colors: ['#db2777', '#fdf2f8'],
    features: ['Design Suave', 'Bordas Arredondadas', 'Minimalista']
  },
  {
    id: 'gaming',
    name: 'Pro Gamer',
    description: 'Modo escuro nativo com acentos neon. Visual agressivo para lojas de games e periféricos.',
    icon: Gamepad2,
    colors: ['#000000', '#10b981'],
    features: ['Dark Mode', 'Efeitos Neon', 'Fontes Bold']
  },
  {
    id: 'home',
    name: 'Casa & Decor',
    description: 'Layout aconchegante estilo Pinterest. Ótimo para móveis, decoração e artesanato.',
    icon: Home,
    colors: ['#78350f', '#fffbeb'],
    features: ['Grid Masonry', 'Tons Terrosos', 'Espaçamento Amplo']
  },
  {
    id: 'sports',
    name: 'Sport Performance',
    description: 'Alto contraste e dinamismo. Para lojas de suplementos, equipamentos e moda fitness.',
    icon: Trophy,
    colors: ['#dc2626', '#171717'],
    features: ['Itálico Dinâmico', 'Botões Grandes', 'Alta Energia']
  },
  {
    id: 'kids',
    name: 'Kids Fun',
    description: 'Visual lúdico, colorido e com formas arredondadas. Perfeito para brinquedos e moda infantil.',
    icon: Baby,
    colors: ['#8b5cf6', '#fef3c7'],
    features: ['Super Arredondado', 'Cores Vibrantes', 'Fonte Divertida']
  },
  {
    id: 'books',
    name: 'Livraria Clássica',
    description: 'Foco em capas e texto. Layout tradicional que transmite confiança e cultura.',
    icon: BookOpen,
    colors: ['#451a03', '#f5f5f4'],
    features: ['Fundo Papel', 'Lista/Grid', 'Leitura Fácil']
  }
] as const;
