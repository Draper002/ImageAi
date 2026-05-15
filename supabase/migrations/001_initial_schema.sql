create extension if not exists "pgcrypto";

create schema if not exists private;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  credit_balance integer not null default 2 check (credit_balance >= 0),
  locale text not null default 'zh' check (locale in ('zh', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  amount integer not null,
  reason text not null check (
    reason in ('signup_bonus', 'generation_debit', 'generation_refund', 'manual_adjustment', 'future_purchase')
  ),
  generation_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null check (status in ('processing', 'succeeded', 'failed')),
  subject text not null,
  image_type text,
  aspect_ratio text,
  style text,
  scene text,
  whitespace text,
  additional_requirements text,
  locale text not null default 'zh' check (locale in ('zh', 'en')),
  prompt_preview_zh text,
  prompt_preview_en text,
  submitted_prompt text not null,
  reference_image_path text,
  generated_image_path text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'credit_ledger_generation_id_fkey'
      and conrelid = 'public.credit_ledger'::regclass
  ) then
    alter table public.credit_ledger
      add constraint credit_ledger_generation_id_fkey
      foreign key (generation_id) references public.generations(id) on delete set null;
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.generations enable row level security;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (locale) on public.profiles to authenticated;
grant select on public.credit_ledger to authenticated;
grant select on public.generations to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "profiles_update_own_locale" on public.profiles;
create policy "profiles_update_own_locale" on public.profiles
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "credit_ledger_select_own" on public.credit_ledger;
create policy "credit_ledger_select_own" on public.credit_ledger
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
  for select to authenticated using (auth.uid() = user_id);

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, credit_balance)
  values (new.id, coalesce(new.email, ''), 2);

  insert into public.credit_ledger (user_id, amount, reason)
  values (new.id, 2, 'signup_bonus');

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function public.reserve_generation_credit(p_user_id uuid, p_generation_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.profiles
    set credit_balance = credit_balance - 1,
        updated_at = now()
    where user_id = p_user_id
      and credit_balance >= 1;

  if not found then
    return false;
  end if;

  insert into public.credit_ledger (user_id, amount, reason, generation_id)
  values (p_user_id, -1, 'generation_debit', p_generation_id);

  return true;
end;
$$;

revoke all on function public.reserve_generation_credit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reserve_generation_credit(uuid, uuid) to service_role;

create or replace function public.refund_generation_credit(p_user_id uuid, p_generation_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.profiles
    set credit_balance = credit_balance + 1,
        updated_at = now()
    where user_id = p_user_id;

  insert into public.credit_ledger (user_id, amount, reason, generation_id)
  values (p_user_id, 1, 'generation_refund', p_generation_id);
end;
$$;

revoke all on function public.refund_generation_credit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.refund_generation_credit(uuid, uuid) to service_role;

insert into storage.buckets (id, name, public)
values ('reference-images', 'reference-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', false)
on conflict (id) do nothing;

drop policy if exists "generated_images_select_own" on storage.objects;
create policy "generated_images_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'generated-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
