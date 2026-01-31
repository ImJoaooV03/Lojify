/*
  # Branding, Storage e Admin Functions
  
  1. Updates:
     - Adiciona colunas de personalização na tabela 'stores'
  
  2. Storage:
     - Cria bucket 'images' para logos e produtos
     - Configura políticas de segurança para o bucket
  
  3. Admin:
     - Cria funções RPC (Remote Procedure Calls) para o dashboard administrativo
     - Estas funções usam SECURITY DEFINER para bypassar RLS apenas para leitura de estatísticas
*/

-- 1. Atualizar tabela Stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#4f46e5';
ALTER TABLE stores ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url text;

-- 2. Configurar Storage (Tentativa de criação via SQL - pode falhar dependendo das permissões da extensão, mas as políticas funcionam se o bucket existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Imagens são públicas" ON storage.objects
  FOR SELECT USING ( bucket_id = 'images' );

CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Usuários podem atualizar seus uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' AND
    auth.uid() = owner
  );

-- 3. Funções Administrativas (RPC)

-- Função para obter visão geral do admin
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_revenue numeric;
  active_stores int;
  total_users int;
  recent_growth json;
BEGIN
  -- Calcular receita total (soma de pedidos pagos/entregues)
  SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue
  FROM orders
  WHERE status IN ('paid', 'shipped', 'delivered');

  -- Contar lojas
  SELECT COUNT(*) INTO active_stores FROM stores;

  -- Contar usuários (profiles)
  SELECT COUNT(*) INTO total_users FROM profiles;

  -- Retornar objeto JSON
  RETURN json_build_object(
    'total_revenue', total_revenue,
    'active_stores', active_stores,
    'total_users', total_users
  );
END;
$$;

-- Função para listar lojas com receita para o admin
CREATE OR REPLACE FUNCTION get_admin_stores()
RETURNS TABLE (
  id uuid,
  name text,
  owner_name text,
  owner_email text,
  status text,
  revenue numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    p.full_name as owner_name,
    p.email as owner_email,
    'active' as status, -- Simplificado por enquanto
    COALESCE((
      SELECT SUM(o.total_amount)
      FROM orders o
      WHERE o.store_id = s.id
      AND o.status IN ('paid', 'shipped', 'delivered')
    ), 0) as revenue,
    s.created_at
  FROM stores s
  LEFT JOIN profiles p ON s.owner_id = p.id
  ORDER BY s.created_at DESC;
END;
$$;
