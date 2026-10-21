import { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Loader2,
  LogIn,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import { supabase } from '../lib/supabase'
import type { Analysis } from '../types/db'
import type { AnalyzeResponse, Ingredient } from '../types/recipe'
import RecipeCard from './RecipeCard'
import SaveResultBar from './SaveResultBar'

const MAX_EDGE = 1024
const JPEG_QUALITY = 0.82
const CACHE_PREFIX = 'lethimcook.scan.v1:'

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('File gambar tidak bisa dibaca.'))
    }
    img.src = url
  })
}

/** Perkecil gambar di browser supaya payload base64 tetap ringan. */
async function fileToDataUrl(file: File): Promise<string> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Browser tidak mendukung canvas.')
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
}

/**
 * Cari riwayat dengan bahan yang mirip (Jaccard).
 * Dipakai untuk mengingatkan "kulkas ini sudah pernah discan".
 */
function findRepeatScan(history: Analysis[] | null, ingredients: Ingredient[]): Analysis | null {
  if (!history || ingredients.length < 3) return null
  const target = new Set(ingredients.map((i) => normalizeName(i.name)).filter(Boolean))
  if (target.size < 3) return null

  let best: Analysis | null = null
  let bestScore = 0
  for (const row of history) {
    const other = new Set(row.detected_ingredients.map((i) => normalizeName(i.name)).filter(Boolean))
    let shared = 0
    for (const name of target) if (other.has(name)) shared++
    if (shared < 4) continue
    const score = shared / (target.size + other.size - shared)
    if (score > bestScore) {
      bestScore = score
      best = row
    }
  }
  return bestScore >= 0.7 ? best : null
}

export default function Scanner({
  onRequireAuth,
  onSaved,
  history,
  onOpenHistory,
}: {
  onRequireAuth: () => void
  onSaved?: () => void
  history?: Analysis[] | null
  onOpenHistory?: (id: string) => void
}) {
  const { user, loading, configured } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loadingScan, setLoadingScan] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [justSaved, setJustSaved] = useState(false)
  const [resume, setResume] = useState(false)
  const resumed = useRef(false)

  // Hasil scan dipulihkan setelah pindah halaman/reload (bukan saat ganti tab,
  // karena komponen ini tetap ter-mount).
  useEffect(() => {
    if (!user) return
    try {
      const raw = sessionStorage.getItem(CACHE_PREFIX + user.id)
      if (!raw) return
      const cache = JSON.parse(raw) as {
        result?: AnalyzeResponse | null
        ingredients?: Ingredient[]
        imageData?: string | null
        notes?: string
        pending?: boolean
      }
      if (!cache.result && !cache.pending) return
      /* oxlint-disable react/set-state-in-effect -- memulihkan hasil dari sessionStorage */
      setResult(cache.result ?? null)
      setIngredients(cache.ingredients ?? cache.result?.detectedIngredients ?? [])
      setImageData(cache.imageData ?? null)
      setPreview(cache.imageData ?? null)
      setNotes(cache.notes ?? '')
      if (cache.pending && cache.imageData) setResume(true)
      /* oxlint-enable react/set-state-in-effect */
    } catch {
      // cache rusak -> abaikan
    }
  }, [user])

  // Analisis yang terputus karena halaman ditutup diulang otomatis saat kembali.
  useEffect(() => {
    if (!resume || resumed.current) return
    resumed.current = true
    setResume(false)
    void analyze()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- cukup dipicu sekali
  }, [resume])

  // Simpan hasil ke sessionStorage, debounce supaya edit bahan tidak menulis terus.
  useEffect(() => {
    if (!user) return
    const key = CACHE_PREFIX + user.id
    const persist = () => {
      if (!result && !imageData) return
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ result, ingredients, imageData, notes, pending: loadingScan }),
        )
      } catch {
        // kuota penuh / storage diblokir -> scan tetap jalan
      }
    }
    const timer = setTimeout(persist, 500)
    window.addEventListener('pagehide', persist)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pagehide', persist)
    }
  }, [user, result, ingredients, imageData, notes, loadingScan])

  useEffect(() => {
    if (!loadingScan) return
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loadingScan])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setResult(null)
    setIngredients([])
    setJustSaved(false)
    try {
      const dataUrl = await fileToDataUrl(file)
      setImageData(dataUrl)
      setPreview(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses gambar.')
    }
  }

  /**
   * Respons bisa kosong kalau server mati/timeout (proxy Vite, workerd restart).
   * Coba sekali lagi sebelum menyerah, jangan sampai JSON.parse pecah.
   */
  async function postAnalyze(body: Record<string, unknown>): Promise<AnalyzeResponse> {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) throw new Error('Sesi kamu habis. Masuk ulang lalu ulangi scan.')

    const raw = JSON.stringify(body)
    let payload: AnalyzeResponse | null = null
    for (let attempt = 1; attempt <= 2 && !payload; attempt++) {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: raw,
      })
      const text = await res.text()
      try {
        payload = text.trim() ? JSON.parse(text) : null
      } catch {
        payload = null
      }
      if (!payload) {
        if (attempt === 2) {
          throw new Error('Server tidak mengirim hasil analisis. Cek koneksi lalu coba lagi.')
        }
        await new Promise((r) => setTimeout(r, 1200))
      }
    }
    if (!payload) throw new Error('Gagal menganalisis gambar.')
    if (!payload.success) throw new Error(payload.error || 'Gagal menganalisis gambar.')
    return payload
  }

  async function analyze() {
    if (!imageData) return
    setElapsed(0)
    setLoadingScan(true)
    setError(null)
    setJustSaved(false)
    try {
      const payload = await postAnalyze({
        image: imageData,
        notes: notes.trim() || undefined,
      })
      setResult(payload)
      setIngredients(payload.detectedIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis gambar.')
    } finally {
      setLoadingScan(false)
    }
  }

  /** Kirim ulang daftar bahan yang sudah dikoreksi, tanpa foto. */
  async function regenerate() {
    const clean = ingredients
      .map((i) => ({ ...i, name: i.name.trim() }))
      .filter((i) => i.name.length > 0)
    if (clean.length === 0) {
      setError('Isi minimal satu bahan sebelum menyusun ulang resep.')
      return
    }
    setElapsed(0)
    setLoadingScan(true)
    setError(null)
    setJustSaved(false)
    try {
      const payload = await postAnalyze({
        ingredients: clean,
        notes: notes.trim() || undefined,
      })
      setResult(payload)
      setIngredients(payload.detectedIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyusun ulang resep.')
    } finally {
      setLoadingScan(false)
    }
  }

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setIngredients((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function removeIngredient(index: number) {
    setIngredients((rows) => rows.filter((_, i) => i !== index))
  }

  function addIngredient() {
    const name = newIngredient.trim()
    if (!name) return
    setIngredients((rows) => [...rows, { name, confidence: 'Tinggi' }])
    setNewIngredient('')
  }

  const repeatScan = result && !justSaved ? findRepeatScan(history ?? null, ingredients) : null

  // Scan wajib login: server memverifikasi token Supabase sebelum memproses foto.
  if (!loading && !user) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-flame-100 text-flame-300">
          <LogIn className="size-5" strokeWidth={1.7} />
        </span>
        <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-fg">
          Masuk untuk mulai memindai
        </h3>
        <p className="copy mx-auto mt-2 max-w-md">
          {configured
            ? 'Analisis, resep tersimpan, dan riwayat seluruhnya terikat ke akunmu. Gratis, cukup email atau Google.'
            : 'Supabase belum dikonfigurasi di Environment server. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY lalu restart dev server.'}
        </p>
        <button
          type="button"
          onClick={onRequireAuth}
          disabled={!configured}
          className="btn-arrow group mt-6 inline-flex items-center gap-2 rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-fg-faint"
        >
          Masuk atau daftar
          <Sparkles className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void handleFile(e.dataTransfer.files?.[0])
            }}
            className="group relative flex min-h-60 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line-2 bg-surface-2 transition-colors hover:border-flame-300/50 sm:min-h-72 lg:min-h-80"
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview bahan kulkas"
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors group-hover:bg-ink-950/85">
                  <RefreshCw className="size-3.5" />
                  Ganti foto
                </span>
              </>
            ) : (
              <span className="flex flex-col items-center gap-3 px-6 text-center text-fg-faint">
                <span className="grid size-12 place-items-center rounded-2xl border border-line bg-surface-2 transition-colors group-hover:border-flame-300/40 group-hover:text-flame-300">
                  <Camera className="size-5" />
                </span>
                <span className="text-sm font-medium text-fg-soft">Pilih atau tarik foto ke sini</span>
                <span className="text-xs">jpg/png/webp · otomatis diperkecil di browser sebelum dikirim</span>
              </span>
            )}
          </button>

          <div className="flex flex-col gap-4">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-fg-muted">
                Catatan (opsional)
              </span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="misal: tidak pakai sambal, mau cepat jadi"
                className="w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-fg-soft outline-none transition-colors placeholder:text-fg-faint focus:border-flame-500"
              />
            </label>

            <button
              type="button"
              onClick={() => void analyze()}
              disabled={!imageData || loadingScan}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-muted disabled:ring-1 disabled:ring-inset disabled:ring-line-2"
            >
              {loadingScan ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menganalisis... {elapsed} dtk
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {result ? 'Analisis ulang foto' : 'Susun lima menu'}
                </>
              )}
            </button>

            {loadingScan && (
              <p className="text-xs leading-relaxed text-fg-faint">
                Membaca foto lalu menyusun resep. Biasanya 15–30 detik. Boleh pindah tab,
                analisis tetap berjalan; kalau halaman ditutup, analisis diulang saat dibuka lagi.
              </p>
            )}

            {error && (
              <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-surface-2/40 px-5 py-3.5 text-xs text-fg-muted sm:px-7">
          {['Foto bahan', 'Koreksi bahan', 'Lima menu'].map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full border border-line bg-surface text-[0.6875rem] font-semibold text-fg-soft">
                {i + 1}
              </span>
              {step}
            </span>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-8">
          <section className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 font-sans text-[1.0625rem] font-semibold tracking-[-0.01em] text-fg">
                  Bahan terdeteksi
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-fg-muted">
                    {ingredients.length}
                  </span>
                </h2>
                <p className="copy-sm mt-1">
                  Bahan salah terbaca? Perbaiki dulu, lalu susun ulang resepnya.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void regenerate()}
                disabled={loadingScan || ingredients.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-flame-300/40 bg-flame-100 px-4 py-2.5 text-sm font-semibold text-flame-200 transition-colors hover:bg-flame-500/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingScan ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Susun ulang resep
              </button>
            </div>

            {repeatScan && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-flame-300/30 bg-flame-100 p-3.5">
                <p className="min-w-0 flex-1 text-xs leading-relaxed text-flame-200">
                  Kulkas ini sudah pernah discan. Hasil dan menunya tersimpan di riwayat.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenHistory?.(repeatScan.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-flame-500 px-3 py-1.5 text-xs font-semibold text-on-accent transition-colors hover:bg-flame-450"
                >
                  Lihat di riwayat
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            )}

            {ingredients.length === 0 ? (
              <p className="mt-4 text-sm text-fg-faint">
                Tidak ada bahan yang terbaca jelas. Tambahkan manual di bawah.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ingredients.map((ingredient, i) => (
                  <li
                    key={`${i}-${ingredient.name}`}
                    className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 py-2"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-flame-500" />
                    <input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(i, { name: e.target.value })}
                      aria-label={`Nama bahan ${i + 1}`}
                      className="min-w-0 flex-1 bg-transparent text-sm text-fg-soft outline-none"
                    />
                    {ingredient.estimatedQuantity && (
                      <span
                        title={ingredient.estimatedQuantity}
                        className="w-24 shrink-0 truncate text-right text-xs text-fg-muted"
                      >
                        {ingredient.estimatedQuantity}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      aria-label={`Hapus ${ingredient.name || `bahan ${i + 1}`}`}
                      className="shrink-0 rounded-md p-1 text-fg-faint transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addIngredient()
                  }
                }}
                placeholder="Tambah bahan, misal: tempe"
                aria-label="Tambah bahan baru"
                className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-fg-soft outline-none transition-colors placeholder:text-fg-faint focus:border-flame-500"
              />
              <button
                type="button"
                onClick={addIngredient}
                disabled={!newIngredient.trim()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-line-2 px-4 py-2.5 text-sm font-medium text-fg-soft transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                Tambah
              </button>
            </div>

            <SaveResultBar
              key={`${result.recipes.map((r) => r.title).join('|')}-${ingredients.length}`}
              result={{ ...result, detectedIngredients: ingredients }}
              imageData={imageData}
              notes={notes}
              onRequireAuth={onRequireAuth}
              onSaved={() => {
                setJustSaved(true)
                onSaved?.()
              }}
            />
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-sans text-[1.0625rem] font-semibold tracking-[-0.01em] text-fg">
                {result.recipes.length} menu tersusun
              </h2>
              {loadingScan && (
                <span className="flex items-center gap-2 text-xs text-fg-muted">
                  <Loader2 className="size-3.5 animate-spin" /> Menyusun ulang... {elapsed} dtk
                </span>
              )}
            </div>
            {result.recipes.length === 0 ? (
              <p className="mt-2 text-sm text-fg-faint">
                Tidak ada resep yang bisa disusun dari bahan ini. Coba foto dengan pencahayaan lebih
                terang.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {result.recipes.map((recipe, i) => (
                  <RecipeCard
                    key={recipe.id || i}
                    recipe={recipe}
                    index={i}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
