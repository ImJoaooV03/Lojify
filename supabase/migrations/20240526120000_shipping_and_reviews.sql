/*
  # Shipping and Reviews System
  
  ## Query Description:
  1. Adds shipping configuration columns to 'stores' table.
  2. Adds shipping amount column to 'orders' table.
  3. Creates 'reviews' table for product ratings.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - stores: +shipping_cost (numeric), +free_shipping_threshold (numeric)
  - orders: +shipping_amount (numeric)
  - reviews: New table linking products and stores
*/

-- 1. Add Shipping Config to Stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric DEFAULT NULL;

-- 2. Add Shipping Amount to Orders (to record what was charged at the time)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_amount numeric DEFAULT 0;

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- 4. Enable RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Reviews
-- Anyone can read reviews
CREATE POLICY "Reviews are public" 
ON public.reviews FOR SELECT 
USING (true);

-- Anyone can insert reviews (Public for now, could be restricted to verified buyers later)
CREATE POLICY "Anyone can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);

-- Only store owner can delete reviews (moderation)
CREATE POLICY "Store owners can delete reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() IN (
  SELECT owner_id FROM public.stores WHERE id = reviews.store_id
));
