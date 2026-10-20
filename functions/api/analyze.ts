import { analyzeImage, type Env } from '../_shared/analyze'

interface RequestPayload {
  image?: string
  notes?: string
}

const MAX_BASE64_LENGTH = 8 * 1024 * 1024

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: RequestPayload
  try {
    body = await request.json()
  } catch {
    return json({ success: false, error: 'Format body request tidak valid (harus JSON).' }, 400)
  }

  if (!body.image) {
    return json({ success: false, error: 'Data gambar (base64) wajib disertakan.' }, 400)
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
