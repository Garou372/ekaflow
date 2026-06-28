-- ============================================================
-- Sprint 10: CRM Extensions for Clients
-- Adds Smart CRM fields to the existing clients table.
-- ============================================================

-- Priority level for client relationship management
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal' CHECK (priority IN ('vip', 'high', 'normal', 'low')),
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS next_follow_up_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Client notes (separate table for multiple notes per client)
CREATE TABLE IF NOT EXISTS public.client_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  note_type text NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'meeting', 'call', 'email', 'follow_up')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own client notes" ON public.client_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS client_notes_client_id_idx ON public.client_notes(client_id);
CREATE INDEX IF NOT EXISTS client_notes_user_id_idx ON public.client_notes(user_id);
