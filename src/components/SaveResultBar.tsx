import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2, LogIn, Save } from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { isRecipeSaved, saveAnalysis, saveRecipe, unsaveRecipe, uploadPhoto } from '../lib/db'
import type { AnalyzeResponse, RecipeSuggestion } from '../types/recipe'

/**
 * Tombol "Simpan hasil" (butuh login) + favorit per resep.
 * Alur: upload foto ke bucket privat -> insert baris `analyses`.
 */
export default function SaveResultBar({
  result,
  imageData,
  notes,
  onRequireAuth,
}: {
  result: AnalyzeResponse
  imageData: string | null
  notes: string
  onRequireAuth: () => void
}) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  async function handleSave() {
    if (!user) {
      onRequireAuth()
      return
    }
    setBusy(true)
    setError(null)
    try {
      let photoPath: string | null = null
      if (imageData) {
        photoPath = await uploadPhoto(user.id, imageData)
      }
      await saveAnalysis(user.id, { notes, photoPath, result })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan hasil.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleFavorite(recipe: RecipeSuggestion) {
    if (!user) {
      onRequireAuth()
      return
    }
    setError(null)
    try {
      const already = favorites[recipe.title] ?? (await isRecipeSaved(recipe.title))
      if (already) {
        await unsaveRecipe(recipe.title)
        setFavorites((f) => ({ ...f, [recipe.title]: false }))
      } else {
        await saveRecipe(user.id, null, recipe)
        setFavorites((f) => ({ ...f, [recipe.title]: true }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan resep.')
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={busy || saved}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : saved ? <Save className="size-4" /> : <LogIn className="size-4" />}
        {saved ? 'Tersimpan' : user ? 'Simpan hasil' : 'Masuk untuk menyimpan'}
      </button>

      {error && <p className="text-xs text-red-300">{error}</p>}

      {result.recipes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {result.recipes.map((recipe) => {
            const on = favorites[recipe.title] ?? false
            return (
              <button
                key={recipe.title}
                type="button"
                onClick={() => void toggleFavorite(recipe)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 transition ${
                  on
                    ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30'
                    : 'bg-white/5 text-neutral-400 ring-white/10 hover:text-white'
                }`}
              >
                {on ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
                {recipe.title}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
