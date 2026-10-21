import type { Ingredient, RecipeSuggestion } from './recipe'

/** Baris tabel `profiles` (1:1 dengan auth.users). */
export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

/** Baris tabel `analyses` — riwayat hasil scan (bahan + menu). */
export interface Analysis {
  id: string
  user_id: string
  notes: string | null
  photo_path: string | null
  detected_ingredients: Ingredient[]
  recipes: RecipeSuggestion[]
  created_at: string
}
