import type { Env } from './env'

export type { Env }

export interface Ingredient {
  name: string
  estimatedQuantity?: string
  confidence?: string
}

export interface Recipe {
  id: string
  title: string
  description?: string
  prepTime?: string
  cookTime?: string
  difficulty?: string
  caloriesApprox?: string
  ingredientsUsed?: string[]
  additionalIngredientsNeeded?: string[]
  steps?: string[]
  chefTips?: string
}

export interface AnalysisResult {
  detectedIngredients: Ingredient[]
  recipes: Recipe[]
}

export const RECIPE_COUNT = 5

const SYSTEM_PROMPT = `Anda adalah Chef & Ahli Kuliner untuk 'Lethimcook.ai'.
Tugas Anda:
1. Teliti dan kenali seluruh bahan makanan, bumbu, sayur, atau daging yang tampak pada foto (termasuk foto isi kulkas).
2. Buat TEPAT ${RECIPE_COUNT} rekomendasi resep lezat, praktis, dan cocok untuk cuisines rumahan Indonesia, hanya dengan memanfaatkan bahan yang terdeteksi (bumbu dasar seperti garam, minyak, bawang putih boleh dianggap tersedia).
3. Setiap resep wajib punya langkah memasak yang runtut dan mudah diikuti.
4. Anda WAJIB mengembalikan output HANYA dalam format JSON valid, tanpa markdown blok \`\`\`json.

Format JSON yang diwajibkan:
{
  "detectedIngredients": [
    { "name": "Nama Bahan", "estimatedQuantity": "Estimasi jumlah/potong", "confidence": "Tinggi" }
  ],
  "recipes": [
    {
      "id": "resep-1",
      "title": "Nama Resep Masakan",
      "description": "Deskripsi singkat menggugah selera",
      "prepTime": "10 menit",
      "cookTime": "20 menit",
      "difficulty": "Mudah",
      "caloriesApprox": "350 kkal",
      "ingredientsUsed": ["Bahan yang terdeteksi"],
      "additionalIngredientsNeeded": ["Bumbu pelengkap umum"],
      "steps": ["Langkah 1...", "Langkah 2..."],
      "chefTips": "Tips rahasia agar masakan makin lezat"
    }
  ]
}`

type ChatMessage = {
  role: 'system' | 'user'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

/** Buang pagar markdown kalau model tetap membungkus JSON. */
function stripCodeFence(raw: string): string {
  return raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
}

/**
 * Ambil objek JSON pertama yang seimbang dari teks.
 * Beberapa provider (mis. 9router) membalas dengan content-type text/event-stream:
 * body berisi JSON utuh diikuti trailer "data: [DONE]", jadi res.json() pecah.
 */
function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i]
    if (inString) {
      if (escaped) escaped = false
      else if (ch === '\\') escaped = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return raw.slice(start, i + 1)
    }
  }
  return null
}

/** Parse respons provider yang bisa berupa JSON biasa atau SSE. */
export function parseProviderPayload(raw: string): any {
  const trimmed = raw.trim()
  if (trimmed.startsWith('{')) {
    const json = extractJsonObject(trimmed)
    if (json) return JSON.parse(json)
  }
  // Bentuk SSE: baris "data: {...}".
  const chunk = trimmed
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('data:') && !line.includes('[DONE]'))
  if (chunk) {
    const json = extractJsonObject(chunk.slice(chunk.indexOf('data:') + 5))
    if (json) return JSON.parse(json)
  }
  const json = extractJsonObject(trimmed)
  if (json) return JSON.parse(json)
  throw new Error('Format JSON dari LLM tidak valid.')
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function normalize(parsed: any): AnalysisResult {
  const recipes = asArray<Recipe>(parsed?.recipes)
    .filter((r) => r && typeof r.title === 'string')
    .slice(0, RECIPE_COUNT)
    .map((r, index) => ({
      ...r,
      id: r.id || `resep-${index + 1}`,
      steps: asArray<string>(r.steps),
      ingredientsUsed: asArray<string>(r.ingredientsUsed),
      additionalIngredientsNeeded: asArray<string>(r.additionalIngredientsNeeded),
    }))

  const detectedIngredients = asArray<Ingredient>(parsed?.detectedIngredients).filter(
    (i) => i && typeof i.name === 'string'
  )

  return { detectedIngredients, recipes }
}

/** Kirim percakapan ke provider OpenAI-compatible, balikkan JSON yang sudah di-parse. */
async function completeJson(env: Env, messages: ChatMessage[]): Promise<any> {
  if (!env.LLM_API_KEY) {
    throw new Error('LLM_API_KEY belum dikonfigurasi di environment server.')
  }

  const baseUrl = (env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = env.LLM_MODEL || 'gpt-4o-mini'

  let res: Response
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.7,
      }),
      // Jangan biarkan request menggantung sampai runtime worker mati.
      signal: AbortSignal.timeout(120_000),
    })
  } catch {
    throw new Error('LLM tidak merespons tepat waktu. Coba lagi.')
  }

  if (!res.ok) {
    // Body provider bisa memuat info sensitif -> jangan diteruskan ke client.
    console.error('LLM error', res.status, await res.text())
    throw new Error(`Panggilan ke LLM gagal (${res.status}). Cek LLM_API_KEY dan LLM_MODEL.`)
  }

  const data: any = parseProviderPayload(await res.text())
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('LLM tidak mengembalikan konten respons.')
  }

  try {
    return typeof content === 'string'
      ? JSON.parse(extractJsonObject(stripCodeFence(content)) ?? '')
      : content
  } catch {
    throw new Error('Format JSON dari LLM tidak valid.')
  }
}

/**
 * Panggil LLM vision (OpenAI-compatible) untuk mengubah foto bahan jadi daftar resep.
 * Melempar Error berisi pesan yang aman ditampilkan ke user.
 */
export async function analyzeImage(
  env: Env,
  imageBase64: string,
  notes?: string
): Promise<AnalysisResult> {
  const imageUrl = imageBase64.startsWith('data:image/')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: notes
            ? `Tolong analisis foto bahan ini. Catatan pengguna: ${notes}`
            : 'Tolong analisis foto bahan makanan ini dan berikan resep lezat yang bisa dimasak.',
        },
        { type: 'image_url', image_url: { url: imageUrl } },
      ],
    },
  ]

  const result = normalize(await completeJson(env, messages))
  if (result.recipes.length === 0) {
    throw new Error('LLM tidak menghasilkan resep yang bisa ditampilkan.')
  }
  return result
}

/**
 * Susun ulang resep dari daftar bahan yang sudah dikoreksi user (tanpa vision).
 * Dipakai saat user mengedit bahan hasil scan.
 */
export async function recipesFromIngredients(
  env: Env,
  ingredients: Ingredient[],
  notes?: string
): Promise<Recipe[]> {
  const list = ingredients
    .map((i) => (i.estimatedQuantity ? `${i.name} (${i.estimatedQuantity})` : i.name))
    .join(', ')

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Bahan yang tersedia (sudah dikoreksi pengguna): ${list}.${
        notes ? ` Catatan pengguna: ${notes}.` : ''
      } Susun TEPAT ${RECIPE_COUNT} resep dari bahan ini. Balas dengan format JSON yang sama seperti instruksi sistem.`,
    },
  ]

  const result = normalize(await completeJson(env, messages))
  if (result.recipes.length === 0) {
    throw new Error('LLM tidak menghasilkan resep yang bisa ditampilkan.')
  }
  return result.recipes
}
