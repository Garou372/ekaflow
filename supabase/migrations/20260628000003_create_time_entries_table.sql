-- Create time_entries table
create table public.time_entries (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    description text not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone,
    duration_minutes integer,
    is_billed boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.time_entries enable row level security;

-- Policies for time_entries
create policy "Enable full access for authenticated users" on public.time_entries
    for all using (auth.role() = 'authenticated');
