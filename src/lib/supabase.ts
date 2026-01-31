import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

// Atualizando os tipos de Template
export type TemplateId = 
  | 'classic' 
  | 'minimal' 
  | 'modern' 
  | 'fashion' 
  | 'tech' 
  | 'gourmet' 
  | 'beauty' 
  | 'gaming' 
  | 'home' 
  | 'sports' 
  | 'kids' 
  | 'books';

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string | null;
  description: string | null;
  phone: string | null;
  pix_key: string | null;
  pix_instructions: string | null;
  shipping_cost: number;
  free_shipping_threshold: number | null;
  template_id: TemplateId; // Atualizado
  created_at: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
  options?: ProductOption[] | null;
  created_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  discount_amount: number;
  shipping_amount: number;
  coupon_code: string | null;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  selected_options?: Record<string, string> | null;
};

export type Coupon = {
  id: string;
  store_id: string;
  code: string;
  discount_percentage: number;
  active: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  store_id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
