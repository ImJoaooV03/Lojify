/*
  # Categorias e Moderação
  
  1. Novas Tabelas
    - `categories`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key)
      - `name` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policies for store owners to manage their categories
*/

-- Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Users can view their own store categories"
  ON public.categories FOR SELECT
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their own store categories"
  ON public.categories FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete their own store categories"
  ON public.categories FOR DELETE
  USING (store_id IN (SELECT id FROM public.stores WHERE owner_id = auth.uid()));

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON public.categories(store_id);
