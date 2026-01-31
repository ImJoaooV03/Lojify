/*
  # Add Banner URL to Stores

  ## Query Description:
  Adiciona a coluna banner_url à tabela stores para permitir personalização visual avançada (Capa da Loja).
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: stores
  - Column: banner_url (TEXT, nullable)
*/

ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS banner_url TEXT;
