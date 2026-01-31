/*
  # Schema Inicial - Lojify

  ## Query Description: Criação das tabelas fundamentais para o funcionamento da plataforma SaaS.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - profiles: Extensão da tabela auth.users para dados do perfil.
  - stores: Tabela principal das lojas (tenants).
  - products: Tabela de produtos vinculados a uma loja.
  
  ## Security Implications:
  - RLS Habilitado em todas as tabelas.
  - Políticas garantem que usuários só acessem suas próprias lojas e produtos.
*/

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Stores table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

-- Products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock integer default 0,
  category text,
  image_url text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on public.profiles 
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles 
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles 
  for insert with check (auth.uid() = id);

-- Policies for Stores
create policy "Users can view own store" on public.stores 
  for select using (auth.uid() = owner_id);
create policy "Users can insert own store" on public.stores 
  for insert with check (auth.uid() = owner_id);
create policy "Users can update own store" on public.stores 
  for update using (auth.uid() = owner_id);

-- Policies for Products
-- Permite leitura se o usuário for dono da loja OU se o produto for público (futuro storefront)
create policy "Store owners can view their products" on public.products 
  for select using (
    exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

create policy "Store owners can insert their products" on public.products 
  for insert with check (
    exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

create policy "Store owners can update their products" on public.products 
  for update using (
    exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

create policy "Store owners can delete their products" on public.products 
  for delete using (
    exists (select 1 from public.stores where stores.id = products.store_id and stores.owner_id = auth.uid())
  );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on re-runs
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
