/*
  # Create Orders and Order Items Tables
  Creates the structure for managing customer orders.

  ## Query Description:
  This migration adds 'orders' and 'order_items' tables to store purchase information.
  It includes Row Level Security (RLS) policies to ensure:
  1. Public users (customers) can INSERT orders.
  2. Store owners can SELECT and UPDATE orders belonging to their store.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: orders (id, store_id, customer_details, total, status)
  - Table: order_items (id, order_id, product_id, quantity, price)
  
  ## Security Implications:
  - RLS Enabled on both tables.
  - Public INSERT access allowed (necessary for checkout).
*/

-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price_at_purchase decimal(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies for Orders

-- 1. Public can create orders (Checkout)
CREATE POLICY "Public can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (true);

-- 2. Store owners can view their store's orders
CREATE POLICY "Store owners can view orders" 
ON public.orders FOR SELECT 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = orders.store_id
  )
);

-- 3. Store owners can update their store's orders (e.g., change status)
CREATE POLICY "Store owners can update orders" 
ON public.orders FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.stores WHERE id = orders.store_id
  )
);

-- Policies for Order Items

-- 1. Public can create order items
CREATE POLICY "Public can create order items" 
ON public.order_items FOR INSERT 
WITH CHECK (true);

-- 2. Store owners can view items of their orders
CREATE POLICY "Store owners can view order items" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    JOIN public.stores ON stores.id = orders.store_id
    WHERE orders.id = order_items.order_id
    AND stores.owner_id = auth.uid()
  )
);
