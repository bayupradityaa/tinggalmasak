/**
 * Runnable check untuk skema Supabase: RLS aktif + policy memakai auth.uid().
 * Jalankan: node scripts/check-db-schema.ts
 *
 * Menangkap kesalahan fatal sebelum migration diterapkan:
 * - tabel user-scoped tanpa RLS -> data bisa dibaca semua orang
 * - policy tanpa scoping per user -> IDOR
 * - bucket storage dibuat public -> foto kulkas terbuka
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const rawSql = readFileSync(join(here, '..', 'supabase', 'migrations', '0001_init.sql'), 'utf8')

// Buang komentar baris: policy check harus menilai kode, bukan dokumentasi.
const sql = rawSql
  .split('\n')
  .map((line) => line.replace(/--.*$/, ''))
  .join('\n')

const TABLES = ['profiles', 'analyses', 'saved_recipes']

for (const table of TABLES) {
  // 1. RLS harus di-enable
  const rls = new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i')
  assert.match(sql, rls, `RLS belum di-enable untuk public.${table}`)

  // 2. Minimal satu policy untuk tabel itu
  const policies = sql.match(
    new RegExp(`create\\s+policy[^;]*?on\\s+public\\.${table}\\b[^;]*?;`, 'gi'),
  )
  assert.ok(policies && policies.length > 0, `Tidak ada policy RLS untuk public.${table}`)

  // 3. Semua policy harus scoping ke auth.uid()
  for (const policy of policies) {
    assert.match(policy, /auth\.uid\(\)/i, `Policy pada public.${table} tidak memakai auth.uid()`)
  }
}

// 4. Bucket storage harus privat
assert.match(
  sql,
  /insert\s+into\s+storage\.buckets[^;]*?kitchen-photos[^;]*?false/i,
  'Bucket kitchen-photos harus dibuat privat (public = false)',
)

// 5. Policy storage harus membatasi ke folder user
const storagePolicies = sql.match(
  /create\s+policy[^;]*?on\s+storage\.objects[^;]*?;/gi,
)
assert.ok(storagePolicies && storagePolicies.length >= 3, 'Policy storage.objects kurang lengkap')
for (const policy of storagePolicies) {
  assert.match(policy, /storage\.foldername\(name\)\)\[1\]\s*=\s*auth\.uid\(\)::text/i)
}

// 6. Trigger profile harus ada
assert.match(sql, /create\s+trigger\s+on_auth_user_created/i)

// 6b. Upsert favorit butuh unique (user_id, title) di saved_recipes
assert.match(
  sql,
  /unique\s*\(\s*user_id\s*,\s*title\s*\)/i,
  'saved_recipes butuh unique (user_id, title) supaya upsert onConflict tidak error',
)

// 7. Tidak boleh ada service_role key di file SQL
assert.doesNotMatch(sql, /service_role/i, 'SQL tidak boleh memakai service_role key')

console.log(
  `OK: ${TABLES.length} tabel RLS aman, bucket privat, trigger profile ada, tanpa service_role.`,
)
