/**
 * Runnable check untuk parser payload LLM (9router SSE + JSON biasa + code fence).
 * Jalankan: node scripts/check-llm-payload.ts
 */
import assert from 'node:assert/strict'
import { parseProviderPayload } from '../functions/_shared/analyze.ts'

const body = {
  detectedIngredients: [{ name: 'Ayam', estimatedQuantity: '1 ekor', confidence: 'Tinggi' }],
  recipes: [{ title: 'Nasi Goreng', steps: ['Tumis', 'Sajikan'] }],
}

// 1. JSON biasa (OpenAI, Groq, Gemini)
const plain = parseProviderPayload(JSON.stringify(body))
assert.equal(plain.recipes[0].title, 'Nasi Goreng')

// 2. Bentuk SSE 9router: JSON utuh + trailer "data: [DONE]"
const sse = parseProviderPayload(
  `data: ${JSON.stringify(body)}\n\ndata: [DONE]\n`
)
assert.equal(sse.detectedIngredients[0].name, 'Ayam')
assert.deepEqual(sse.recipes[0].steps, ['Tumis', 'Sajikan'])

// 3. String berisi JSON di dalam code fence markdown
const fenced = parseProviderPayload('```json\n' + JSON.stringify(body) + '\n```')
assert.equal(fenced.recipes[0].title, 'Nasi Goreng')

// 4. JSON ngumpet di teks lain (ambil objek pertama yang seimbang)
const noisy = parseProviderPayload('Berikut hasil:\n' + JSON.stringify(body) + '\nSelesai.')
assert.equal(noisy.recipes.length, 1)

// 5. Tidak ada JSON sama sekali -> error (bukan diam)
assert.throws(() => parseProviderPayload('maaf, saya tidak bisa'))

console.log('OK: parseProviderPayload menangani JSON, SSE, code fence, dan teksiesen.')
