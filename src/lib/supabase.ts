/**
 * Klien Supabase (singleton).
 *
 * Pakai anon key + RLS. Tidak ada service_role key di browser.
 * Kalau env belum diisi, `supabase` bernilai null dan app tetap bisa
 * dipakai sebagai tamu (analisis tetap jalan, simpan/daftar dimatikan).
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Menangani callback Google OAuth (?code=... / #access_token=...)
        detectSessionInUrl: true,
      },
    })
  : null
