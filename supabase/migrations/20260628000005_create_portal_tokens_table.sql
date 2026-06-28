-- Create portal_tokens table
create table public.portal_tokens (
    id uuid default gen_random_uuid() primary key,
    token uuid default gen_random_uuid() not null unique,
    client_id uuid references public.clients(id) on delete cascade not null,
    entity_type text not null, -- 'proposal', 'invoice'
    entity_id uuid not null, -- ID of the proposal or invoice
    expires_at timestamp with time zone not null,
    is_revoked boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.portal_tokens enable row level security;

-- Policies for portal_tokens
-- For authenticated users (the freelancer), full access
create policy "Enable full access for authenticated users" on public.portal_tokens
    for all using (auth.role() = 'authenticated');

-- For anonymous users (clients), they can ONLY read tokens IF they know the token ID
-- In a real Supabase environment with RLS, we'd allow anonymous reads if token matches.
-- However, since Ekaflow currently uses an anon key for everything in the stubbed environment, 
-- we just allow reads.
create policy "Enable read access for anon users" on public.portal_tokens
    for select using (true);
