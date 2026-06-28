-- Create notifications table
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    -- user_id uuid references auth.users(id) on delete cascade not null, -- If using real auth
    -- We'll use a string for user_id to match the existing stubbed auth approach, or omit it if single-tenant for now
    type text not null, -- 'proposal_accepted', 'invoice_paid', 'system', etc.
    title text not null,
    message text not null,
    link_url text,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies for notifications
create policy "Enable full access for authenticated users" on public.notifications
    for all using (auth.role() = 'authenticated');
