/**
 * Akses data Supabase (semua lewat RLS, tanpa service_role).
 */
import { supabase } from './supabase'
import type { Analysis } from '../types/db'
import type { AnalyzeResponse } from '../types/recipe'

const BUCKET = 'kitchen-photos'

function client() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
  return supabase
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}

/** Upload foto kulkas ke bucket privat. Path = "<user_id>/<uuid>.jpg". */
export async function uploadPhoto(userId: string, dataUrl: string): Promise<string | null> {
  const blob = await dataUrlToBlob(dataUrl)
  const path = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
  if (error) throw error
  return path
}

/** URL bertempoh untuk foto privat (bucket tidak public). */
export async function signedPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null
  const { data, error } = await client().storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data?.signedUrl ?? null
}

/** Simpan hasil analisis ke riwayat. */
export async function saveAnalysis(
  userId: string,
  input: { notes?: string; photoPath: string | null; result: AnalyzeResponse },
): Promise<void> {
  const { error } = await client().from('analyses').insert({
    user_id: userId,
    notes: input.notes?.trim() || null,
    photo_path: input.photoPath,
    detected_ingredients: input.result.detectedIngredients,
    recipes: input.result.recipes,
  })
  if (error) throw error
}

/** Daftar riwayat milik user yang sedang login. */
export async function listAnalyses(limit = 50): Promise<Analysis[]> {
  const { data, error } = await client()
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Analysis[]
}

/** Hapus foto dari bucket (dipakai saat riwayat dihapus). */
export async function deletePhoto(path: string | null): Promise<void> {
  if (!path) return
  const { error } = await client().storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function deleteAnalysis(id: string): Promise<void> {
  const { error } = await client().from('analyses').delete().eq('id', id)
  if (error) throw error
}
