-- Create job_queue table
create table public.job_queue (
    id uuid default gen_random_uuid() primary key,
    job_name text not null,
    payload jsonb not null default '{}'::jsonb,
    run_at timestamp with time zone not null default timezone('utc'::text, now()),
    status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.job_queue enable row level security;

create policy "Enable full access for authenticated users" on public.job_queue
    for all using (auth.role() = 'authenticated');
