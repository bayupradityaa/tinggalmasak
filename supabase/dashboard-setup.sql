-- =============================================================================
-- Lethimcook.ai - SQL manual di Supabase Dashboard
-- Dashboard -> SQL Editor -> New query -> paste SATU BLOK -> Run -> lihat "Success"
--
-- Catatan: "Confirm email" di Authentication -> Providers -> Email sudah MATI
-- (mailer_autoconfirm = true), jadi user baru langsung bisa login tanpa klik link.
-- Blok 1 di bawah hanya perlu kalau user lama dibuat saat confirm email masih ON.
--
-- Verifikasi bucket (harus balas 200 + "id":"kitchen-photos"):
--   curl -s "<SUPABASE_URL>/storage/v1/bucket/kitchen-photos" \
--        -H "apikey: <SUPABASE_ANON_KEY>" -H "Authorization: Bearer <ACCESS_TOKEN_USER>"
-- PENTING: pakai access token user yang login, bukan anon key — role anon tidak
-- boleh select baris storage.buckets, jadi akan muncul "Bucket not found" palsu.
-- =============================================================================


-- =============================================================================
-- BLOK 1 (opsional) - konfirmasi user yang dibuat saat "Confirm email" masih ON
-- =============================================================================
-- update auth.users
-- set email_confirmed_at = now()
-- where email = 'email-user-di sini';


-- =============================================================================
-- BLOK 2 - bucket privat untuk foto kulkas
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('kitchen-photos', 'kitchen-photos', false)
on conflict (id) do nothing;


-- =============================================================================
-- BLOK 3 - policy RLS storage (3 policy, satu-satu)
-- Path foto: "<user_id>/<file>" -> (storage.foldername(name))[1] = user id
-- =============================================================================
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


-- =============================================================================
-- BLOK 4 (nanti saja, setelah semua tes kelar) - hapus user uji
-- auth.users cascade ke profiles/analyses/saved_recipes, TAPI bucket foto
-- TIDAK ikut terhapus -> hapus objek storage dulu (path = "<user_id>/<file>").
-- Ganti <user_id> dan <file> dengan nilai nyata.
-- =============================================================================
-- delete from storage.objects
-- where bucket_id = 'kitchen-photos' and (storage.foldername(name))[1] = '<user_id>';
--
-- delete from auth.users where email = 'email-user-di sini';
