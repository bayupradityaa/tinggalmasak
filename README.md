# TinglyMasak.ai.id

Foto isi kulkas → 5 ide menu lengkap dengan resep. Satu alur saja: web app → LLM vision (9router, OpenAI-compatible).

Dokumen ini = **panduan pasang dari nol sampai live** (lokal → Cloudflare Pages).

---

## 1. Yang Dibutuhkan

| Kebutuhan | Keterangan |
| --- | --- |
| Node.js 20+ | Cek: `node -v` |
| Akun Cloudflare | Gratis cukup. Domain `tinggalmasak.ai.id` opsional (butuh zona DNS di Cloudflare). |
| Akun GitHub | Repo: `https://github.com/bayupradityaa/tinggalmasak.git` |
| Provider LLM (OpenAI-compatible) | **9router** (default) — atau OpenAI / OpenRouter / Gemini OpenAI-compat / Groq. API key wajib. |

---

## 2. Struktur Project

```
tinggalmasak/
├─ functions/              # Pages Functions (server-side, otomatis jadi endpoint)
│  ├─ _shared/             # kode inti: env + analyze
│  └─ api/analyze.ts       # POST /api/analyze
├─ src/                    # frontend React + Vite
│  ├─ auth/                # AuthProvider + context (Supabase session)
│  ├─ components/          # AuthBar, AuthModal, HistoryPanel, SaveResultBar
│  ├─ lib/                 # supabase client + akses data (RLS)
│  └─ types/               # tipe recipe + baris DB
├─ supabase/migrations/    # SQL skema: tabel + RLS + storage
├─ scripts/                # cek otomatis (node, tanpa framework)
├─ wrangler.toml           # config Cloudflare Pages
├─ .dev.vars.example       # template env server-side
├─ .env.example            # template env sisi klien (VITE_*)
└─ package.json
```

---

## 3. Cara Kerja

Dua jalur terpisah:

```
web (React/Vite) ──base64──▶ /api/analyze ──▶ 9router vision ──▶ { detectedIngredients, recipes[] }
        │                                        (tamu boleh, tanpa login)
        │
        └──▶ supabase-js (anon key + RLS) ──▶ auth.users / profiles / analyses / saved_recipes
             (hanya saat user login: simpan hasil, riwayat, favorit)      │
                                                                        └──▶ Storage: kitchen-photos (bucket privat)
```

Pola keamanan: **tidak ada service_role key di mana pun**. Browser pakai anon key,
databasetegeri sendiri yang membatasi akses lewat RLS (`auth.uid()`). Pages Functions
tidak memegang secret Supabase sama sekali.

Respons `recipes[]` (dipakai frontend):

```json
{
  "detectedIngredients": [{ "name": "Ayam", "estimatedQuantity": "1 ekor", "confidence": "Tinggi" }],
  "recipes": [{
    "id": "resep-1",
    "title": "Nasi Goreng Ayam",
    "description": "...",
    "prepTime": "10 menit",
    "cookTime": "15 menit",
    "difficulty": "Mudah",
    "caloriesApprox": "450 kkal",
    "ingredientsUsed": ["Ayam", "Beras"],
    "additionalIngredientsNeeded": ["Telur"],
    "steps": ["Panaskan minyak", "Tumis bahan", "Sajikan"],
    "chefTips": "Kurangi garam, pakai kaldu ayam."
  }]
}
```

Server menormalisasi hasil LLM: maximal 5 resep, array yang hilang jadi `[]`, `id` kosong auto diisi `resep-N`.

### 3.1 Database & Akun (Supabase)

| Tabel | Isi |who bisa akses |
| --- | --- | --- |
| `profiles` | 1:1 dengan `auth.users` (nama, avatar) | pemilik saja |
| `analyses` | riwayat hasil scan (bahan + resep jsonb, path foto) | pemilik saja |
| `saved_recipes` | resep favorit | pemilik saja |

Semua tabel punya RLS aktif dengan policy `auth.uid() = user_id` (atau `= id`).
Bucket `kitchen-photos` = privat, path foto selalu `<user_id>/<file>`.

Aturan main:
- **Analisis tetap terbuka untuk tamu** (gratis untuk coba). Login baru dibutuhkan
  kalau mau **simpan hasil**, lihat riwayat, atau favoritkan resep.
- Foto kulkas di-upload ke Storage privat; ditampilkan lewat signed URL (berlaku 1 jam).

---

## 4. Pasang di Komputer Sendiri (Lokal)

```bash
git clone https://github.com/bayupradityaa/tinggalmasak.git
cd tinggalmasak
npm install
```

### 4.1 Isi env lokal

```bash
cp .dev.vars.example .dev.vars      # Windows: copy .dev.vars.example .dev.vars
```

Isi minimal (9router lokal, lihat bagian 6):

```
LLM_API_KEY="<api key 9router>"
LLM_BASE_URL="http://127.0.0.1:20128/v1"
LLM_MODEL="ngoding-aaa"
```

Env sisi klien (Supabase) terpisah, di `.env.local`:

```bash
cp .env.example .env.local      # Windows: copy .env.example .env.local
```

```
VITE_SUPABASE_URL="https://<project-id>.supabase.co"
VITE_SUPABASE_ANON_KEY="<anon public key>"
```

> `.env.local` sudah ter-ignore git. Jangan pernah commit nilai aslinya.
> Anon key aman dipublikasikan (RLS yang menjaga), tapi tetap best practice tidak di-commit.

### 4.2 Siapkan database Supabase

1. Dashboard Supabase → **SQL Editor → New query**.
2. Paste isi `supabase/migrations/0001_init.sql` → **Run**.
   (atau pakai CLI: `supabase db push`)
3. **Authentication → Providers → Email**: matikan "Confirm email" kalau mau user langsung
   masuk setelah daftar (untuk testing cepat).
4. **Authentication → URL Configuration → Redirect URLs**: tambah
   `http://localhost:5173` dan domain produksi `https://tinggalmasak.ai.id`.
5. **Authentication → Providers → Google** (kalau mau login Google):
   - buat OAuth Client ID di Google Cloud Console (Web application),
   - Authorized redirect URI: `https://<project-id>.supabase.co/auth/v1/callback`,
   - copy Client ID + Client Secret ke provider Google di Supabase.

Tanpa Supabase yang sudah dikonfigurasi, aplikasi tetap jalan sebagai tamu
(analisis normal, tombol simpan dimatikan).

### 4.3 Jalankan

Dua terminal:

```bash
# terminal 1 — server-side (Pages Functions)
npm run build
npx wrangler pages dev dist --port 8788

# terminal 2 — frontend
npm run dev
```

Buka `http://localhost:5173`. Vite mem-proxy `/api` ke `http://localhost:8788` (lihat `vite.config.ts`).

### 4.4 Cek otomatis

```bash
npm run check   # assert parser payload LLM (JSON / SSE / code fence) + skema DB/RLS
npm run lint    # oxlint
npm run build   # tsc -b + vite build
```

Smoke test end-to-end (butuh terminal 1 jalan):

```bash
node scripts/smoke-test.ts http://127.0.0.1:8788
```

---

## 5. Deploy ke Cloudflare Pages

### 5.1 Bikin project Pages

**Opsi 1 — lewat dashboard (paling gampang)**

1. Dashboard Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pilih repo `bayupradityaa/tinggalmasak`, branch `main`.
3. Isi build setting:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: (kosongkan, repo sudah berisi app di root)
4. **Save and Deploy**.

**Opsi 2 — lewat CLI**

```bash
npm run build
npx wrangler pages deploy dist --project-name tinggalmasak
```

> `wrangler.toml` sudah berisi `pages_build_output_dir = "dist"`, jadi build output ikut terbaca.

### 5.2 Environment variables di produksi

Dashboard: **Pages → project → Settings → Environment variables → Add**. Isi untuk **Production** (dan **Preview** kalau mau preview ikut jalan):

| Nama | Wajib | Contoh / arti |
| --- | --- | --- |
| `LLM_API_KEY` | ya | key 9router (produksi: key `hermes` untuk instance AWS) |
| `LLM_BASE_URL` | tidak | default `https://api.openai.com/v1`. Pakai URL publik 9router AWS, mis. `http://<host-9router>:20128/v1` |
| `LLM_MODEL` | tidak | default `gpt-4o-mini` (harus model vision). Pakai `ngoding-aaa` untuk 9router |
| `VITE_SUPABASE_URL` | ya (kalau mau login) | `https://<project-id>.supabase.co` — dipakai saat build |
| `VITE_SUPABASE_ANON_KEY` | ya (kalau mau login) | anon public key — dipakai saat build |

> `VITE_*` = variabel **build-time** (Vite menyuntik ke bundle). Set di Pages → Settings →
> Environment variables, lalu **redeploy** supaya ter-build ulang.
> `VITE_SUPABASE_ANON_KEY` aman di bundle (itu gunanya); RLS yang membatasi data.

CLI juga bisa:

```bash
npx wrangler pages secret put LLM_API_KEY --project-name tinggalmasak
npx wrangler pages secret put LLM_BASE_URL --project-name tinggalmasak
npx wrangler pages secret put LLM_MODEL --project-name tinggalmasak
```

### 5.3 Domain sendiri

Dashboard → Pages → project → **Custom domains → Set up a custom domain** → `tinggalmasak.ai.id` (dns record-nya dibuat otomatis kalau zone-nya di Cloudflare).

---

## 6. Setup 9router

9router = server LLM dengan API **OpenAI-compatible**. Ada yang lokal (`http://127.0.0.1:20128/v1`)
dan yang versi AWS (dipakai untuk produksi).

### 6.1 Lokal (default dev)

Cek server hidup:

```bash
curl http://127.0.0.1:20128/v1/models
```

Isi `.dev.vars`:

```
LLM_API_KEY="<api key 9router>"
LLM_BASE_URL="http://127.0.0.1:20128/v1"
LLM_MODEL="ngoding-aaa"
```

`ngoding-aaa` = alias combo di 9router; resolve ke model vision (mis. `deepseek-v4.1-flash`) dan
vision-nya jalan.

### 6.2 Ambil API key (kalau belum punya)

Key tersimpan di SQLite 9router, tabel `apiKeys` (ada `Default Key` dan `hermes`):

```bash
node -e "const D=require('better-sqlite3')(process.env.APPDATA+'/9router/runtime/node_modules/better-sqlite3');const db=new D(process.env.APPDATA+'/9router/db/data.sqlite',{readonly:true});console.log(db.prepare('select * from apiKeys').all())"
```

`auth\cli-secret` **bukan** API key.

### 6.3 Produksi

1. Pakai URL **publik** 9router di AWS (bukan `127.0.0.1` — Pages tidak bisa akses loopback server Anda).
2. `LLM_API_KEY` = key `hermes`.
3. `LLM_MODEL` = `ngoding-aaa`.

### 6.4 Catatan format respons

9router balas `content-type: text/event-stream`: body berisi JSON utuh + trailer `data: [DONE]`.
Jadi **jangan** pakai `res.json()` langsung ke LLM. `functions/_shared/analyze.ts` sudah pakai
`parseProviderPayload()` yang menangani JSON biasa maupun SSE.

---

## 7. Verifikasi (checklist)

Setelah deploy, cek satu per satu:

```bash
# 1. Halaman web hidup
curl -I https://tinggalmasak.ai.id

# 2. Endpoint analyze (butuh gambar base64)
curl -X POST https://tinggalmasak.ai.id/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,<BASE64>","notes":"tanpa sambal"}'
# balas: {"success":true,"detectedIngredients":[...],"recipes":[...]} (5 resep)
```

Cek alur akun (manual, di browser):

1. Daftar akun baru → masuk (atau "Lanjut dengan Google").
2. Scan foto → tekan **Simpan hasil** → buka tab **Riwayat** → data muncul.
3. Refresh halaman → riwayat tetap ada (tanda sudah tersimpan di DB).
4. Logout → riwayat kosong (data milik user lain tidak terlihat).

---

## 8. Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| `500 LLM_API_KEY belum dikonfigurasi` | Env server belum diset → isi `.dev.vars` (lokal) atau Pages secret (produksi). |
| `Panggilan ke LLM gagal (401)` | API key salah / expired, atau `LLM_BASE_URL` salah. |
| `Panggilan ke LLM gagal (404)` | `LLM_BASE_URL` belum zawatkan `/v1`. |
| `Format JSON dari LLM tidak valid` | Model tidak returning JSON → cek `response_format` / ganti model vision. |
| `LLM tidak menghasilkan resep yang bisa ditampilkan` | Model balas JSON tapi tanpa `recipes[].title`. |
| `413` / "gambar terlalu besar" | Base64 > 8 MB. Frontend otomatis perkecil ke max 1024 px JPEG kualitas 0.82. |
| Frontend "Failed to fetch" saat lokal | Terminal `wrangler pages dev` mati, atau port bukan 8788. |
| `405` saat deploy | Build output salah → harus `dist`, build command `npm run build`. |
| Tombol "Simpan" tidak aktif | Supabase belum dikonfigurasi → isi `.env.local` (lokal) / env `VITE_*` (produksi). |
| `Failed to fetch` / `row-level security violation` | Tabel dibuat tanpa policy RLS, atau policy tidak pakai `auth.uid()`. Jalankan ulang `supabase/migrations/0001_init.sql`. |
| Foto riwayat tidak muncul | Signed URL expired (1 jam) → refresh halaman. |
| Login Google balik ke halaman login | Redirect URL belum didaftarkan di Supabase → Settings → URL Configuration. |

---

## 9. Update & Deploy Ulang

```bash
git add -A
git commit -m "feat: ..."
git push origin main
```

Kalau project Pages terhubung ke GitHub, deploy otomatis. Kalau manual:

```bash
npm run build
npx wrangler pages deploy dist --project-name tinggalmasak
```

---

## 10. Batasan & Catatan

- **Batas upload**: 8 MB base64 (~6 MB file) di server; frontend otomatis perkecil ke max 1024 px JPEG kualitas 0.82.
- **Waktu proses**: 15–30 detik tipikal (LLM vision). Frontend menampilkan timer.
- **Penyimpanan**: hasil analisis hanya disimpan kalau user login dan menekan
  "Simpan hasil". Tamu tidak meninggalkan jejak. Foto disimpan di bucket privat
  Supabase (RLS: hanya pemilik yang bisa akses).

---

## 11. Daftar Endpoint

| Method | Path | Isi | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/analyze` | `{ image, notes? }` | Analisis foto → `{ detectedIngredients, recipes[] }` (maks 5 resep). |
