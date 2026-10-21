import {
  analyzeImage,
  recipesFromIngredients,
  type Env,
  type Ingredient,
} from '../_shared/analyze'
import { authenticate } from '../_shared/auth'

interface RequestPayload {
  image?: string
  notes?: string
  ingredients?: unknown
}

const MAX_BASE64_LENGTH = 8 * 1024 * 1024
const MAX_INGREDIENTS = 40

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/** Bahan dari client dipakai ulang apa adanya, jadi bentuknya divalidasi ketat. */
function parseIngredients(value: unknown): Ingredient[] {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, MAX_INGREDIENTS)
    .map((item): Ingredient | null => {
      if (!item || typeof item !== 'object') return null
      const raw = item as Record<string, unknown>
      const name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 80) : ''
      if (!name) return null
      return {
        name,
        estimatedQuantity:
          typeof raw.estimatedQuantity === 'string'
            ? raw.estimatedQuantity.trim().slice(0, 40) || undefined
            : undefined,
        confidence:
          typeof raw.confidence === 'string' ? raw.confidence.slice(0, 20) : undefined,
      }
    })
    .filter((item): item is Ingredient => item !== null)
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Scan wajib login: token user diverifikasi sebelum foto diproses.
  const auth = await authenticate(request, env)
  if (!auth.ok) {
    return json({ success: false, error: auth.error }, auth.status)
  }

  let body: RequestPayload
  try {
    body = await request.json()
  } catch {
    return json({ success: false, error: 'Format body request tidak valid (harus JSON).' }, 400)
  }

  const ingredients = parseIngredients(body.ingredients)

  // Mode 2: bahan sudah dikoreksi user -> susun ulang resep tanpa vision.
  if (ingredients.length > 0) {
    try {
      const recipes = await recipesFromIngredients(env, ingredients, body.notes)
      return json({ success: true, detectedIngredients: ingredients, recipes })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.'
      return json({ success: false, error: message }, 500)
    }
  }

  if (!body.image) {
    return json(
      { success: false, error: 'Kirim foto bahan atau daftar bahan yang sudah dikoreksi.' },
      400,
    )
  }
  if (body.image.length > MAX_BASE64_LENGTH) {
    return json({ success: false, error: 'Ukuran gambar terlalu besar (maks. sekitar 6 MB).' }, 413)
  }

  let result
  try {
    result = await analyzeImage(env, body.image, body.notes)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan internal.'
    return json({ success: false, error: message }, 500)
  }

  return json({
    success: true,
    detectedIngredients: result.detectedIngredients,
    recipes: result.recipes,
  })
}
