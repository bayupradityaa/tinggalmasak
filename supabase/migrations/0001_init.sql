-- =============================================================================
-- TinggalMasak.ai.id - Skema awal (auth + database + storage)
-- Jalankan di Supabase Dashboard -> SQL Editor (New query -> paste -> Run)
-- atau: supabase db push
--
-- Prinsip:
--   * Semua tabel user-scoped memakai RLS dengan auth.uid().
--   * Tidak ada service_role key di frontend; anon key + RLS = penjaga.
--   * Bucket Storage privat; path foto diawali <user_id>/.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tabel
-- -----------------------------------------------------------------------------

-- 1:1 dengan auth.users (dibuat otomatis oleh trigger di bawah)
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Riwayat hasil scan (bahan terdeteksi + resep), 1 baris per analisis
create table if not exists public.analyses (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users (id) on delete cascade,
  notes                text,
  photo_path           text,
  detected_ingredients jsonb not null default '[]'::jsonb,
  recipes              jsonb not null default '[]'::jsonb,
  created_at           timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

-- Resep yang di-favorit user
create table if not exists public.saved_recipes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid references public.analyses (id) on delete cascade,
  title       text not null,
  recipe      jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, title)
);

create index if not exists saved_recipes_user_created_idx
  on public.saved_recipes (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Trigger: buat profile otomatis saat user register
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profile untuk user yang sudah ada sebelum trigger dibuat
insert into public.profiles (id, display_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
where email is not null
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.analyses     enable row level security;
alter table public.saved_recipes enable row level security;

-- profiles: user hanya boleh baca & ubah profilnya sendiri
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- analyses: hanya pemilik baris
drop policy if exists "analyses_select_own" on public.analyses;
create policy "analyses_select_own" on public.analyses
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "analyses_insert_own" on public.analyses;
create policy "analyses_insert_own" on public.analyses
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "analyses_update_own" on public.analyses;
create policy "analyses_update_own" on public.analyses
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own" on public.analyses
  for delete to authenticated using (auth.uid() = user_id);

-- saved_recipes: hanya pemilik baris
drop policy if exists "saved_recipes_select_own" on public.saved_recipes;
create policy "saved_recipes_select_own" on public.saved_recipes
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "saved_recipes_insert_own" on public.saved_recipes;
create policy "saved_recipes_insert_own" on public.saved_recipes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "saved_recipes_update_own" on public.saved_recipes;
create policy "saved_recipes_update_own" on public.saved_recipes
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "saved_recipes_delete_own" on public.saved_recipes;
create policy "saved_recipes_delete_own" on public.saved_recipes
  for delete to authenticated using (auth.uid() = user_id);

-- Grants
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles       to authenticated;
grant select, insert, update, delete on public.analyses      to authenticated;
grant select, insert, update, delete on public.saved_recipes to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: bucket privat untuk foto kulkas
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('kitchen-photos', 'kitchen-photos', false)
on conflict (id) do nothing;

-- Path foto selalu "<user_id>/<file>" -> (storage.foldername(name))[1] = user id
drop policy if exists "photos_read_own" on storage.objects;
create policy "photos_read_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'kitchen-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kitchen-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'kitchen-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
