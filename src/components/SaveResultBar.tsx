import { useState } from 'react'
import { Check, Loader2, Save } from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { saveAnalysis, uploadPhoto } from '../lib/db'
import type { AnalyzeResponse } from '../types/recipe'

/**
 * Tombol "Simpan ke riwayat" (butuh login).
 * Alur: upload foto ke bucket privat -> insert baris `analyses` (bahan + menu).
 */
export default function SaveResultBar({
  result,
  imageData,
  notes,
  onRequireAuth,
  onSaved,
}: {
  result: AnalyzeResponse
  imageData: string | null
  notes: string
  onRequireAuth: () => void
  onSaved?: () => void
}) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  async function handleSave() {
    if (!user) {
      onRequireAuth()
      return
    }
    setBusy(true)
    setError(null)
    setNote(null)
    try {
      let photoPath: string | null = null
      if (imageData) {
        // ponytail: bucket storage mungkin belum dibuat -> hasil tetap disimpan tanpa foto.
        photoPath = await uploadPhoto(user.id, imageData).catch(() => {
          setNote('Foto tidak tersimpan (bucket storage belum siap). Hasil tetap tersimpan.')
          return null
        })
      }
      await saveAnalysis(user.id, { notes, photoPath, result })
      setSaved(true)
      onSaved?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan hasil.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={busy || saved}
        className="flex items-center gap-2 rounded-xl bg-flame-500 px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-muted"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : saved ? (
          <Check className="size-4" />
        ) : (
          <Save className="size-4" />
        )}
        {saved ? 'Tersimpan di riwayat' : 'Simpan ke riwayat'}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {note && <p className="text-xs text-amber-600">{note}</p>}

      {!saved && (
        <p className="text-xs text-fg-faint">Bahan dan menu langsung masuk ke Riwayat akunmu.</p>
      )}
      {saved && (
        <p className="text-xs text-fg-faint">Buka tab Riwayat untuk melihat atau menghapusnya.</p>
      )}
    </div>
  )
}
