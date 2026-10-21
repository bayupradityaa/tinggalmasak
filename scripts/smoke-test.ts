/**
 * Smoke test lokal: cek /api/analyze (alur utama 9router).
 * Jalankan: node scripts/smoke-test.ts [baseUrl]
 */
import { readFileSync } from 'node:fs'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:8788'
const image = readFileSync(new URL('./fixtures/food.jpg', import.meta.url)).toString('base64')

const res = await fetch(`${baseUrl}/api/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: `data:image/jpeg;base64,${image}`, notes: 'tanpa sambal' }),
})
const body = await res.json()
console.log('status:', res.status)
console.log('success:', body.success)
console.log('bahan:', body.detectedIngredients?.length ?? 0)
console.log('resep:', body.recipes?.length ?? 0)
console.log('langkah per resep:', body.recipes?.map((r: any) => r.steps?.length ?? 0).join(','))
if (body.error) console.log('error:', body.error)
