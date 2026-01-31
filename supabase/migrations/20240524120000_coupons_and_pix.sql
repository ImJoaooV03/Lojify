/*
  # Sistema de Cupons e Pix
  
  1. Novas Tabelas
    - `coupons`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key)
      - `code` (text, unique per store)
      - `discount_percentage` (numeric)
      - `active` (boolean)
      - `created_at` (timestamp)

  2. Alterações em Tabelas Existentes
    - `stores`: Adiciona `pix_key` e `pix_instructions`
    - `orders`: Adiciona `discount_amount` e `coupon_code`

  3. Segurança
    - Enable RLS on `coupons`
    - Policies for store owners to manage coupons
    - Policies for public to read active coupons (for checkout validation)
*/

-- Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Add Pix fields to Stores
ALTER TABLE stores ADD COLUMN IF NOT EXISTS pix_key TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS pix_instructions TEXT;

-- Add Discount fields to Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Store owners can manage their coupons" ON coupons
  FOR ALL USING (auth.uid() = (SELECT owner_id FROM stores WHERE id = coupons.store_id));

CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (active = true);
