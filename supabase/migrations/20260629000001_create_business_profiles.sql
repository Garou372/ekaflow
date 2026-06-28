-- ============================================================
-- Sprint 10: Business Profiles Table
-- Replaces localStorage-based company info with Supabase storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text,
  tax_id text,         -- generic tax ID
  gstin text,          -- Indian GST Identification Number
  upi_id text,         -- UPI payment address (e.g. name@upi)
  invoice_prefix text NOT NULL DEFAULT 'INV',
  currency text NOT NULL DEFAULT 'INR',
  default_payment_terms integer NOT NULL DEFAULT 30, -- days
  logo_url text,       -- Supabase Storage URL
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Only the owner can read/write their own profile
CREATE POLICY "Users manage their own business profile" ON public.business_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
