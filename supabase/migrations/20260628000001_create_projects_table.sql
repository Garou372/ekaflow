-- Create projects table
create table public.projects (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete cascade not null,
    name text not null,
    description text,
    status text not null default 'active' check (status in ('active', 'completed', 'on_hold')),
    budget numeric(10,2),
    hourly_rate numeric(10,2),
    start_date date,
    due_date date,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies for projects (Assuming authenticated users can do everything for now)
create policy "Enable full access for authenticated users" on public.projects
    for all using (auth.role() = 'authenticated');

-- Add project_id to proposals
alter table public.proposals
add column project_id uuid references public.projects(id) on delete set null;

-- Add project_id to invoices
alter table public.invoices
add column project_id uuid references public.projects(id) on delete set null;
