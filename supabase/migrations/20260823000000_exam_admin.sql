create type public.admin_role as enum ('pending', 'admin', 'owner', 'rejected');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.admin_role not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  candidate_name text not null check (char_length(trim(candidate_name)) between 2 and 60),
  answers jsonb not null,
  correct_count smallint not null check (correct_count between 0 and 12),
  total smallint not null default 12 check (total = 12),
  percent smallint not null check (percent between 0 and 100),
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index exam_attempts_created_at_idx on public.exam_attempts (created_at desc);
create index exam_attempts_candidate_name_idx on public.exam_attempts (lower(candidate_name));

alter table public.admin_profiles enable row level security;
alter table public.exam_attempts enable row level security;

create or replace function public.current_admin_role()
returns public.admin_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_profiles where id = auth.uid();
$$;

revoke all on function public.current_admin_role() from public;
grant execute on function public.current_admin_role() to authenticated;

create policy "Users read own profile and owner reads all"
on public.admin_profiles for select
to authenticated
using (id = auth.uid() or public.current_admin_role() = 'owner');

create policy "Approved admins read exam attempts"
on public.exam_attempts for select
to authenticated
using (public.current_admin_role() in ('owner', 'admin'));

grant select on public.admin_profiles to authenticated;
grant select on public.exam_attempts to authenticated;

create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_profiles (id, email, role)
  values (new.id, coalesce(new.email, ''), 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_admin_user();
