-- ============================================================
-- Sprint 11: Workspaces & Subscriptions
-- ============================================================

-- ── Workspaces ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug text UNIQUE,
  logo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can manage their workspace" ON public.workspaces
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace members can view workspace" ON public.workspaces
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

-- ── Workspace Members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
  invited_email text,
  invite_token text UNIQUE,
  invite_expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace admins can manage members" ON public.workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
    ) OR auth.uid() = user_id
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_members.workspace_id AND owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS workspace_members_workspace_idx ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS workspace_members_token_idx ON public.workspace_members(invite_token);

-- Allow anon to look up invite tokens (to accept invite without logging in first)
CREATE POLICY "Anyone can read invite token" ON public.workspace_members
  FOR SELECT USING (invite_token IS NOT NULL);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'business')),
  status text NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
  trial_ends_at timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '14 days'),
  current_period_start timestamp with time zone DEFAULT timezone('utc'::text, now()),
  current_period_end timestamp with time zone DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
  -- Razorpay fields
  razorpay_customer_id text,
  razorpay_subscription_id text,
  -- Billing history snapshot
  amount_paid integer DEFAULT 0, -- in paise (INR smallest unit)
  currency text DEFAULT 'INR',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own subscription" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ── Billing History ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.billing_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan text NOT NULL,
  amount integer NOT NULL, -- paise
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'failed', 'refunded')),
  razorpay_payment_id text,
  razorpay_order_id text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own billing history" ON public.billing_history
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS billing_history_user_idx ON public.billing_history(user_id);

-- ── Feedback ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'general')),
  title text NOT NULL,
  description text NOT NULL,
  current_route text,
  browser_info text,
  app_version text,
  screenshot_url text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can submit and view their own feedback" ON public.feedback
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
-- Admins (in production, use a specific role) can read all feedback via service key

CREATE INDEX IF NOT EXISTS feedback_user_idx ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON public.feedback(feedback_type);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON public.feedback(status);

-- ── Usage Tracking ────────────────────────────────────────────
-- Track monthly usage per user for quota enforcement
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('invoice_created', 'proposal_created', 'ai_query', 'storage_bytes')),
  period_month text NOT NULL, -- e.g. '2026-06' (YYYY-MM)
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, metric_type, period_month)
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own usage metrics" ON public.usage_metrics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS usage_metrics_user_period_idx ON public.usage_metrics(user_id, period_month);

-- Auto-provision starter subscription for new users via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'starter', 'trialing')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
