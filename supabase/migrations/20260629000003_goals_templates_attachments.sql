-- ============================================================
-- Sprint 10: Business Goals Table
-- Tracks monthly/quarterly/yearly revenue goals.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('monthly', 'quarterly', 'yearly', 'custom')),
  target_amount numeric(14, 2) NOT NULL DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- Sprint 10: Templates Table
-- Supports proposal templates, invoice templates, email templates.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('proposal', 'invoice', 'email')),
  content jsonb NOT NULL DEFAULT '{}',  -- flexible JSON for line items, subject, body, etc.
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own templates" ON public.templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ============================================================
-- Sprint 10: Attachments Table
-- Polymorphic attachments for clients, projects, invoices, etc.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('client', 'project', 'invoice', 'proposal', 'expense')),
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size integer,  -- bytes
  mime_type text,
  storage_path text NOT NULL,  -- Supabase Storage path
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own attachments" ON public.attachments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS attachments_entity_idx ON public.attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS attachments_user_id_idx ON public.attachments(user_id);
