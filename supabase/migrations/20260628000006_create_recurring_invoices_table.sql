-- Create recurring_invoices table
create table public.recurring_invoices (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete cascade not null,
    project_id uuid references public.projects(id) on delete set null,
    frequency text not null check (frequency in ('weekly', 'monthly', 'yearly')),
    next_run_date date not null,
    last_run_date date,
    status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
    template_data jsonb not null, -- Stores line items, discount, tax, etc.
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.recurring_invoices enable row level security;

create policy "Enable full access for authenticated users" on public.recurring_invoices
    for all using (auth.role() = 'authenticated');
