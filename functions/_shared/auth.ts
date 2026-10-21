/**
 * Verifikasi sesi Supabase dari header Authorization.
 *
 * Tanpa dependensi: Supabase bisa dicek langsung lewat REST `/auth/v1/user`
 * memakai anon/publishable key (aman untuk server, tidak perlu service_role).
 */
import type { Env } from './env'

export interface AuthUser {
  id: string
  email: string | null
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; status: number }

/** Header `Authorization: Bearer <access_token>` milik user yang sedang login. */
export async function authenticate(request: Request, env: Env): Promise<AuthResult> {
  const header = request.headers.get('Authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''

  if (!token) {
    return {
      ok: false,
      error: 'Kamu belum masuk. Masuk atau daftar dulu untuk memakai scan.',
      status: 401,
    }
  }

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return {
      ok: false,
      error: 'Server belum dikonfigurasi (SUPABASE_URL / SUPABASE_ANON_KEY belum diisi).',
      status: 503,
    }
  }

  let response: Response
  try {
    response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    return { ok: false, error: 'Gagal menghubungi layanan autentikasi.', status: 502 }
  }

  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      error: 'Sesi tidak valid atau sudah berakhir. Masuk ulang lalu ulangi scan.',
      status: 401,
    }
  }

  if (!response.ok) {
    return { ok: false, error: 'Gagal memverifikasi sesi.', status: 502 }
  }

  const data = (await response.json()) as { id?: string; email?: string }
  if (!data?.id) {
    return { ok: false, error: 'Sesi tidak valid.', status: 401 }
  }

  return { ok: true, user: { id: data.id, email: data.email ?? null } }
}
