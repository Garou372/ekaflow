-- Create automation_rules table
create table public.automation_rules (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    trigger_event text not null, -- e.g., 'invoice.created', 'proposal.accepted'
    conditions jsonb not null default '[]'::jsonb, -- Array of condition objects
    actions jsonb not null, -- Array of action objects to perform
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.automation_rules enable row level security;

create policy "Enable full access for authenticated users" on public.automation_rules
    for all using (auth.role() = 'authenticated');

-- Insert some default rules as examples
insert into public.automation_rules (name, trigger_event, conditions, actions)
values 
('Notify on proposal acceptance', 'proposal.accepted', '[]', '[{"type": "notification", "template": "Your proposal was accepted!"}]'),
('Follow up on sent proposal', 'proposal.sent', '[]', '[{"type": "enqueue_job", "job_name": "email_follow_up", "delay_hours": 48}]');
