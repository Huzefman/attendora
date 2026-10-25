-- 0043_team_pulse.sql
-- Team Pulse: an optional weekly check-in with aggregate-only reporting.
--
-- Employees can read and write only their own responses. Owner/HR read an
-- aggregate through get_pulse_summary(), never the raw rows.

create table if not exists public.pulse_responses (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  week_start date not null,
  score smallint not null check (score between 1 and 5),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, week_start)
);

create index if not exists idx_pulse_responses_week_start
  on public.pulse_responses (week_start);

create index if not exists idx_pulse_responses_employee_id
  on public.pulse_responses (employee_id);

drop trigger if exists set_updated_at on public.pulse_responses;
create trigger set_updated_at
  before update on public.pulse_responses
  for each row execute function public.set_updated_at();

alter table public.pulse_responses enable row level security;

drop policy if exists pulse_responses_select_own on public.pulse_responses;
create policy pulse_responses_select_own on public.pulse_responses
  for select
  using (employee_id = public.get_my_employee_id());

drop policy if exists pulse_responses_insert_own on public.pulse_responses;
create policy pulse_responses_insert_own on public.pulse_responses
  for insert
  with check (employee_id = public.get_my_employee_id());

drop policy if exists pulse_responses_update_own on public.pulse_responses;
create policy pulse_responses_update_own on public.pulse_responses
  for update
  using (employee_id = public.get_my_employee_id())
  with check (employee_id = public.get_my_employee_id());

grant select, insert, update on public.pulse_responses to authenticated;

-- Aggregate-only read for owner / HR / system_admin.
create or replace function public.get_pulse_summary(weeks int default 8)
returns table (
  week_start date,
  average_score numeric,
  response_count bigint
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  caller_role user_role := public.get_my_role();
  window_weeks int := greatest(1, least(coalesce(weeks, 8), 52));
begin
  if caller_role not in ('owner', 'hr', 'system_admin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  return query
  select
    pr.week_start,
    round(avg(pr.score)::numeric, 2) as average_score,
    count(*)::bigint as response_count
  from public.pulse_responses pr
  where pr.week_start >= (
    date_trunc('week', current_date)::date - ((window_weeks - 1) * 7)
  )
  group by pr.week_start
  order by pr.week_start;
end;
$$;

revoke all on function public.get_pulse_summary(int) from public;
grant execute on function public.get_pulse_summary(int) to authenticated;
