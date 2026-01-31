# Lojify - Plataforma SaaS de E-commerce

Bem-vindo ao Lojify! Uma plataforma completa estilo "Nuvemshop" onde usuários podem criar suas próprias lojas virtuais, gerenciar produtos, pedidos e clientes.

## 🚀 Funcionalidades

### Para o Lojista (Tenant)
- **Dashboard Completo**: Visão geral de vendas, pedidos e métricas.
- **Gestão de Produtos**: Cadastro com fotos, controle de estoque e categorias.
- **Gestão de Pedidos**: Acompanhamento de status (Pago, Enviado, Entregue) e packing list.
- **Marketing**: Criação de Cupons de Desconto.
- **Financeiro**: Configuração de Chave Pix para recebimento direto.
- **Personalização**: Upload de Logo e escolha de cores da loja.
- **CRM**: Visualização de clientes e histórico de compras.

### Para o Cliente Final (Storefront)
- **Loja Rápida**: Navegação fluida e responsiva.
- **Carrinho de Compras**: Gestão de itens.
- **Checkout Otimizado**: Pagamento via Pix ou Cartão (Simulado).
- **Rastreamento**: Consulta de status do pedido via ID e Email.
- **SEO Dinâmico**: Compartilhamento bonito no WhatsApp/Redes Sociais.

### Para o Super Admin (Dono da Plataforma)
- **Visão Global**: Métricas de receita total e lojas ativas.
- **Gestão de Tenants**: Listagem e controle de todas as lojas.
- **Segurança**: Modo de manutenção e logs.

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Vite
- **Estilização**: Tailwind CSS, Lucide React (Ícones)
- **Backend/Banco de Dados**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Gráficos**: Recharts
- **SEO**: React Helmet Async

## 📦 Como Rodar

1. Instale as dependências:
   \`\`\`bash
   yarn install
   \`\`\`

2. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   yarn run dev
   \`\`\`

## 🔑 Credenciais de Acesso

### Super Admin
- **URL**: \`/admin/login\`
- **Email**: \`joaovicrengel@gmail.com\`
- **Senha**: \`Acesso4321@@\`

### Lojista (Exemplo)
Você pode criar uma nova conta em \`/register\` ou usar uma existente se tiver criado.

## 📝 Próximos Passos Sugeridos

1. **Deploy**: Publique o projeto na Vercel ou Netlify.
2. **Domínios Personalizados**: Implementar lógica para domínios customizados (ex: loja.com.br).
3. **Emails Transacionais**: Integrar SendGrid ou Resend para avisar sobre novos pedidos.

---
Desenvolvido com ❤️ usando Dualite.
