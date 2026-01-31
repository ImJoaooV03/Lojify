-- Adicionar coluna de template na tabela stores
ALTER TABLE stores 
ADD COLUMN template_id TEXT DEFAULT 'classic';

-- Comentário para documentação
COMMENT ON COLUMN stores.template_id IS 'ID do tema visual escolhido para a loja (classic, minimal, modern)';
