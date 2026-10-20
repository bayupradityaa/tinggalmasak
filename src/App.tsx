import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ChefHat, Loader2, Sparkles, Upload } from 'lucide-react'
import type { AnalyzeResponse, Ingredient, RecipeSuggestion } from './types/recipe'

const MAX_EDGE = 1024
const JPEG_QUALITY = 0.82

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

function IngredientChip({ ingredient }: { ingredient: Ingredient }) {
  return (
    <li className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/90 ring-1 ring-white/15">
      <span className="font-medium">{ingredient.name}</span>
      {ingredient.estimatedQuantity && (
        <span className="text-white/50"> · {ingredient.estimatedQuantity}</span>
      )}
    </li>
  )
}

function RecipeCard({ recipe, index }: { recipe: RecipeSuggestion; index: number }) {
  return (
    <article className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">
          <span className="mr-2 text-emerald-400">{index + 1}.</span>
          {recipe.title}
        </h3>
        <span className="shrink-0 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
          {recipe.difficulty}
        </span>
      </div>

      {recipe.description && (
        <p className="mt-2 text-sm text-white/70">{recipe.description}</p>
      )}

      <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
        {recipe.prepTime && (
          <div>
            <dt className="inline">Prep: </dt>
            <dd className="inline">{recipe.prepTime}</dd>
          </div>
        )}
        {recipe.cookTime && (
          <div>
            <dt className="inline">Masak: </dt>
            <dd className="inline">{recipe.cookTime}</dd>
          </div>
        )}
        {recipe.caloriesApprox && (
          <div>
            <dt className="inline">Kalori: </dt>
            <dd className="inline">{recipe.caloriesApprox}</dd>
          </div>
        )}
      </dl>

      {recipe.ingredientsUsed && recipe.ingredientsUsed.length > 0 && (
        <p className="mt-3 text-xs text-white/60">
          <span className="text-white/80">Bahan: </span>
          {recipe.ingredientsUsed.join(', ')}
        </p>
      )}
      {recipe.additionalIngredientsNeeded && recipe.additionalIngredientsNeeded.length > 0 && (
        <p className="mt-1 text-xs text-white/60">
          <span className="text-white/80">Perlu tambahan: </span>
          {recipe.additionalIngredientsNeeded.join(', ')}
        </p>
      )}

      {recipe.steps && recipe.steps.length > 0 && (
        <ol className="mt-4 space-y-2 text-sm text-white/80">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {recipe.chefTips && (
        <p className="mt-4 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-200/90">
          <span className="font-semibold">Tips: </span>
          {recipe.chefTips}
        </p>
      )}
    </article>
  )
}

export default function App() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!loading) return
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loading])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setResult(null)
    try {
      const dataUrl = await fileToDataUrl(file)
      setImageData(dataUrl)
      setPreview(dataUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses gambar.')
    }
  }

  async function analyze() {
    if (!imageData) return
    setElapsed(0)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, notes: notes.trim() || undefined }),
      })
      const data: AnalyzeResponse = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis gambar.')
      }
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis gambar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20">
            <ChefHat className="size-3.5" />
            tinggalmasak.ai.id
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Foto kulkasmu, <span className="text-emerald-400">5 menu</span> langsung jadi
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-400">
            Upload foto isi kulkas, dapat 5 resep rumahan beserta bahan dan langkah masaknya.
          </p>
        </header>

        <section className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="relative flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-neutral-900/60 transition hover:border-emerald-400/50 sm:w-40"
            >
              {preview ? (
                <img src={preview} alt="Preview bahan" className="size-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-neutral-500">
                  <Upload className="size-6" />
                  <span className="text-xs">Pilih / ambil foto</span>
                </span>
              )}
            </button>

            <div className="flex-1 space-y-3">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-400">
                  Catatan (opsional)
                </span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="misal: tidak pakai sambal, mau cepat jadi"
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-neutral-600 focus:border-emerald-400/60"
                />
              </label>

              <button
                type="button"
                onClick={analyze}
                disabled={!imageData || loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menganalisis... {elapsed} dtk
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    {result ? 'Analisis ulang' : 'Cari 5 ide menu'}
                  </>
                )}
              </button>

              {loading && (
                <p className="text-xs text-neutral-500">
                  Membaca foto + menyusun resep. biasanya 15-30 detik, jangan tutup halaman.
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}
        </section>

        {result && (
          <>
            <section className="mt-10">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Bahan terdeteksi
              </h2>
              {result.detectedIngredients.length === 0 ? (
                <p className="text-sm text-neutral-500">Tidak ada bahan yang terbaca jelas.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {result.detectedIngredients.map((ingredient, i) => (
                    <IngredientChip key={`${ingredient.name}-${i}`} ingredient={ingredient} />
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10 space-y-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                {result.recipes.length} ide menu
              </h2>
              {result.recipes.map((recipe, i) => (
                <RecipeCard key={recipe.id || i} recipe={recipe} index={i} />
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
