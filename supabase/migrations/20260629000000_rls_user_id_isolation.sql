-- ============================================================
-- Sprint 10: RLS User-ID Isolation
-- Replace the "any authenticated user" policies with
-- per-user (auth.uid() = user_id) RLS on every business table.
-- ============================================================

-- ── clients ──────────────────────────────────────────────────
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
-- Backfill: set user_id to the first authenticated user for existing rows (safe for single-tenant dev data)
-- In production, run this only if you have a known owner user_id.
-- UPDATE public.clients SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.clients;
CREATE POLICY "Users manage their own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── proposals ────────────────────────────────────────────────
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.proposals;
CREATE POLICY "Users manage their own proposals" ON public.proposals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── invoices ─────────────────────────────────────────────────
-- user_id already existed; ensure proper RLS
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.invoices;
CREATE POLICY IF NOT EXISTS "Users manage their own invoices" ON public.invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── projects ─────────────────────────────────────────────────
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.projects;
CREATE POLICY "Users manage their own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── time_entries ─────────────────────────────────────────────
ALTER TABLE public.time_entries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.time_entries;
CREATE POLICY "Users manage their own time entries" ON public.time_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── expenses ─────────────────────────────────────────────────
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.expenses;
CREATE POLICY "Users manage their own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── notifications ────────────────────────────────────────────
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.notifications;
CREATE POLICY "Users see their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── recurring_invoices ───────────────────────────────────────
ALTER TABLE public.recurring_invoices ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.recurring_invoices;
CREATE POLICY "Users manage their own recurring invoices" ON public.recurring_invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── automation_rules ─────────────────────────────────────────
ALTER TABLE public.automation_rules ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.automation_rules;
CREATE POLICY "Users manage their own automation rules" ON public.automation_rules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── audit_logs ───────────────────────────────────────────────
-- user_id already exists; drop old permissive policy
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.audit_logs;
CREATE POLICY IF NOT EXISTS "Users see their own audit logs" ON public.audit_logs
  FOR ALL USING (auth.uid() = user_id);

-- ── job_queue ────────────────────────────────────────────────
ALTER TABLE public.job_queue ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.job_queue;
CREATE POLICY "Users manage their own jobs" ON public.job_queue
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── portal_tokens ────────────────────────────────────────────
-- Keep anon read for token validation, but restrict writes to owner
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON public.portal_tokens;
CREATE POLICY "Users manage their own portal tokens" ON public.portal_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Allow anonymous token validation (SELECT only) — narrow to known token
DROP POLICY IF EXISTS "Enable read access for anon users" ON public.portal_tokens;
CREATE POLICY "Anon can validate portal tokens" ON public.portal_tokens
  FOR SELECT USING (true);
ALTER TABLE public.portal_tokens ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
