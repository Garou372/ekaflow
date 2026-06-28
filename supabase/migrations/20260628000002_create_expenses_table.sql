-- Create expenses table
create table public.expenses (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete set null,
    amount numeric(10,2) not null check (amount >= 0),
    category text not null,
    date date not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.expenses enable row level security;

-- Policies for expenses
create policy "Enable full access for authenticated users" on public.expenses
    for all using (auth.role() = 'authenticated');
