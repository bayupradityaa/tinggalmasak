import { useCallback, useEffect, useState } from 'react'
import { Bookmark, History, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { deleteAnalysis, deletePhoto, listAnalyses, listSavedRecipes, signedPhotoUrl } from '../lib/db'
import type { Analysis, SavedRecipe } from '../types/db'
import type { RecipeSuggestion } from '../types/recipe'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryPanel() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [saved, setSaved] = useState<SavedRecipe[]>([])
  const [error, setError] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  // Spinuer selama data milik user ini belum selesai dimuat.
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)
  const loading = (user?.id ?? null) !== loadedUserId

  const load = useCallback(async () => {
    if (!user) return
    try {
      const [rows, favs] = await Promise.all([listAnalyses(), listSavedRecipes()])
      setAnalyses(rows)
      setSaved(favs)
      setError(null)
      // Signed URL dibuat lazily per baris (butuh bucket privat).
      const urls: Record<string, string> = {}
      for (const row of rows) {
        if (!row.photo_path) continue
        try {
          const url = await signedPhotoUrl(row.photo_path)
          if (url) urls[row.id] = url
        } catch {
          // foto gagal diambil ->_history tetap tampil, tanpa gambar
        }
      }
      setPhotoUrls(urls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat.')
    } finally {
      if (user) setLoadedUserId(user.id)
    }
  }, [user])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- sinkronisasi dengan Supabase (sumber data eksternal)
    void load()
  }, [load])

  async function handleDelete(id: string) {
    try {
      const row = analyses.find((r) => r.id === id)
      await deleteAnalysis(id)
      // Foto ikut dibuang, kalau tidak bucket akan menumpuk file sampah.
      await deletePhoto(row?.photo_path ?? null).catch(() => {})
      setAnalyses((rows) => rows.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus riwayat.')
    }
  }

  if (loading) {
    return (
      <p className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" /> Memuat riwayat...
      </p>
    )
  }

  if (error) {
    return <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</p>
  }

  if (analyses.length === 0 && saved.length === 0) {
    return (
      <p className="flex flex-col items-center gap-2 py-10 text-center text-sm text-neutral-500">
        <History className="size-6" />
        Belum ada riwayat. Upload foto lalu tekan <span className="text-white/80">Simpan hasil</span>.
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {analyses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Riwayat analisis
          </h2>
          <ul className="space-y-3">
            {analyses.map((row) => (
              <li key={row.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-start gap-3">
                  {photoUrls[row.id] && (
                    <img
                      src={photoUrls[row.id]}
                      alt="Foto kulkas"
                      className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-neutral-500">{formatDate(row.created_at)}</p>
                    <p className="mt-1 text-sm text-white/90">
                      {row.detected_ingredients.map((i) => i.name).join(', ') || 'Bahan tidak terbaca'}
                    </p>
                    {row.notes && <p className="mt-1 text-xs italic text-neutral-500">Catatan: {row.notes}</p>}
                    <ul className="mt-2 space-y-0.5 text-xs text-neutral-400">
                      {row.recipes.map((r, i) => (
                        <li key={r.id || i}>
                          {i + 1}. {r.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row.id)}
                    className="shrink-0 rounded-lg p-2 text-neutral-500 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label="Hapus riwayat"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {saved.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            <Bookmark className="size-3.5" /> Resep tersimpan
          </h2>
          <ul className="space-y-2">
            {saved.map((row) => (
              <li key={row.id} className="rounded-xl bg-white/5 p-3 text-sm text-white/90 ring-1 ring-white/10">
                <p className="font-medium">{row.title}</p>
                {(row.recipe as RecipeSuggestion).description && (
                  <p className="mt-0.5 text-xs text-neutral-500">{(row.recipe as RecipeSuggestion).description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
