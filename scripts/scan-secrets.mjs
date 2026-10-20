/**
 * Scan isi repo (file tracked + seluruh history git) untuk pola kredensial.
 * Jalankan: node scripts/scan-secrets.mjs
 * Exit 0 = aman, exit 1 = ada temuan.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const PATTERNS = [
  { name: 'LLM/OpenAI key', re: /\bsk-(?!your|isi)[A-Za-z0-9_-]{16,}/g },
  { name: 'Anthropic key', re: /\bsk-ant-[A-Za-z0-9_-]{20,}/g },
  { name: 'Telegram bot token', re: /\b\d{8,12}:[A-Za-z0-9_-]{30,}/g },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{30,}/g },
  { name: 'GitHub token', re: /\bgh[pousr]_[A-Za-z0-9]{30,}/g },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: 'JWT (supabase service role)', re: /\beyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{60,}\.[A-Za-z0-9_-]{20,}/g },
  { name: 'Private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
]

// Placeholder yang aman (dipakai di file contoh).
const SAFE_BINARY = String.fromCharCode(0)
const SAFE = /your|isi-|placeholder|example|xxx|<|changeme|redacted|xxx/i

function scan(text, label) {
  const hits = []
  for (const { name, re } of PATTERNS) {
    for (const m of text.match(re) ?? []) {
      if (SAFE.test(m)) continue
      hits.push(`${name} @ ${label}: ${m.slice(0, 10)}...`)
    }
  }
  return hits
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 50e6 })

const hits = []

// 1. File tracked di working tree
for (const file of git('ls-files').split('\n').filter(Boolean)) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    continue // binary
  }
  hits.push(...scan(text, file))
}

// 2. Seluruh history: setiap blob di semua commit
const blobs = new Set(
  git('rev-list', '--all', '--objects')
    .split('\n')
    .map((l) => l.split(' ')[0])
    .filter((h) => /^[0-9a-f]{40}$/.test(h))
)
for (const blob of blobs) {
  let type
  let text
  try {
    type = git('cat-file', '-t', blob).trim()
    if (type !== 'blob') continue
    text = git('cat-file', '-p', blob)
  } catch {
    continue
  }
  if (text.includes(SAFE_BINARY)) continue // binary
  hits.push(...scan(text, `history:${blob.slice(0, 8)}`))
}

if (hits.length === 0) {
  console.log('OK: tidak ada pola kredensial di file tracked maupun history git.')
  process.exit(0)
}
console.log('WARN: temuan berikut (periksa manual):')
for (const h of [...new Set(hits)]) console.log(' -', h)
process.exit(1)
