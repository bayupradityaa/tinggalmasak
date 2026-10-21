import { useEffect, useState } from 'react'
import { ChevronDown, History, Loader2, Trash2, UtensilsCrossed } from 'lucide-react'
import { deleteAnalysis, deletePhoto, signedPhotoUrl } from '../lib/db'
import type { Analysis } from '../types/db'
import IngredientChip from './IngredientChip'
import RecipeCard from './RecipeCard'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HistoryPanel({
  rows,
  error,
  focusId,
  onChanged,
}: {
  rows: Analysis[] | null
  error: string | null
  focusId?: string | null
  onChanged: () => void
}) {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  // Baris yang dibuka bisa datang dari "Aktivitas terakhir" (focusId).
  const [openId, setOpenId] = useState<string | null>(focusId ?? null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Signed URL dibuat lazily per baris (bucket privat).
  useEffect(() => {
    if (!rows) return
    let cancelled = false
    void (async () => {
      const urls: Record<string, string> = {}
      for (const row of rows) {
        if (!row.photo_path) continue
        try {
          const url = await signedPhotoUrl(row.photo_path)
          if (url) urls[row.id] = url
        } catch {
          // foto gagal diambil -> riwayat tetap tampil tanpa gambar
        }
      }
      if (!cancelled) setPhotoUrls(urls)
    })()
    return () => {
      cancelled = true
    }
  }, [rows])

  async function handleDelete(row: Analysis) {
    try {
      await deleteAnalysis(row.id)
      // Foto ikut dibuang, kalau tidak bucket akan menumpuk file sampah.
      await deletePhoto(row.photo_path).catch(() => {})
      onChanged()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Gagal menghapus riwayat.')
    }
  }

  if (rows === null) {
    return (
      <p className="flex items-center justify-center gap-2 py-12 text-sm text-fg-faint">
        <Loader2 className="size-4 animate-spin" /> Memuat riwayat...
      </p>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-10 text-center shadow-card sm:p-12">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-flame-100 text-flame-300">
          <History className="size-5" strokeWidth={1.7} />
        </span>
        <p className="mt-4 text-[1.0625rem] font-semibold tracking-[-0.01em] text-fg">
          Belum ada riwayat
        </p>
        <p className="copy mx-auto mt-2 max-w-sm">
          Selesai scan, tekan <span className="text-fg-soft">Simpan ke riwayat</span>. Bahan dan
          menunya tersimpan di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(error || deleteError) && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {deleteError || error}
        </p>
      )}

      <p className="text-xs text-fg-faint">
        {rows.length} hasil scan tersimpan. Klik baris untuk membuka menunya.
      </p>

      <ul className="space-y-3">
        {rows.map((row) => {
          const open = openId === row.id
          return (
            <li
              key={row.id}
              className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${
                open ? 'border-line-2 shadow-card' : 'border-line hover:border-line-2'
              }`}
            >
              <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : row.id)}
                  aria-expanded={open}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left sm:gap-4"
                >
                  {photoUrls[row.id] ? (
                    <img
                      src={photoUrls[row.id]}
                      alt="Foto kulkas"
                      className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-line sm:size-20"
                    />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-surface-2 text-fg-faint ring-1 ring-line sm:size-20">
                      <UtensilsCrossed className="size-5" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-fg-faint">{formatDate(row.created_at)}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed font-medium text-fg-soft">
                      {row.detected_ingredients.map((i) => i.name).join(', ') ||
                        'Bahan tidak terbaca'}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
                      <UtensilsCrossed className="size-3.5 text-flame-300" />
                      {row.recipes.length} menu
                      {row.notes ? ` · ${row.notes}` : ''}
                    </p>
                  </div>

                  <ChevronDown
                    className={`mt-1 size-4 shrink-0 text-fg-faint transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => void handleDelete(row)}
                  className="shrink-0 rounded-lg p-2 text-fg-faint transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Hapus riwayat"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {open && (
                <div className="border-t border-line bg-canvas/60 px-4 py-5 sm:px-5">
                  {row.detected_ingredients.length > 0 && (
                    <ul className="mb-5 flex flex-wrap gap-2">
                      {row.detected_ingredients.map((ingredient, i) => (
                        <IngredientChip key={`${ingredient.name}-${i}`} ingredient={ingredient} />
                      ))}
                    </ul>
                  )}

                  {row.recipes.length === 0 ? (
                    <p className="text-sm text-fg-faint">Riwayat ini tidak menyimpan menu.</p>
                  ) : (
                    <div className="space-y-3">
                      {row.recipes.map((recipe, i) => (
                        <RecipeCard
                          key={recipe.id || i}
                          recipe={recipe}
                          index={i}
                          defaultOpen={i === 0}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
