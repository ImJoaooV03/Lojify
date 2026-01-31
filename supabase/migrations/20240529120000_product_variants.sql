/*
  # Adicionar Variantes de Produto
  
  Adiciona suporte para opções de produto (Tamanho, Cor, etc).
  
  ## Mudanças
  - Adiciona coluna `options` (JSONB) na tabela `products`.
    Estrutura esperada: [{ "name": "Tamanho", "values": ["P", "M", "G"] }]
*/

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb;

-- Atualizar a view ou funções se necessário (neste caso, o select * já pega a nova coluna)
