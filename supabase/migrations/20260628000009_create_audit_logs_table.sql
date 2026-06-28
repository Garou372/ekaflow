-- Create audit_logs table
create table public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    action text not null, -- e.g., 'invoice_created', 'proposal_accepted'
    entity_type text not null, -- e.g., 'invoice', 'proposal'
    entity_id uuid, -- Reference ID (loose reference, no strict constraint to allow for deletions)
    user_id uuid references auth.users(id) on delete set null, -- Optional for now, useful for future multi-tenant
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

create policy "Enable full access for authenticated users" on public.audit_logs
    for all using (auth.role() = 'authenticated');
