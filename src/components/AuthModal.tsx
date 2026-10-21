import { useState, type FormEvent } from 'react'
import { Loader2, X } from 'lucide-react'
import { useAuth } from '../auth/auth-context'

type Mode = 'signin' | 'signup'

const FIELD =
  'w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-fg-soft outline-none transition-colors placeholder:text-fg-faint focus:border-flame-500'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp, signInWithGoogle, configured } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        onClose()
      } else {
        await signUp(email.trim(), password, fullName)
        onClose()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses.'
      // Pendaftaran butuh konfirmasi email -> itu kabar baik, bukan error.
      if (message.startsWith('Pendaftaran berhasil')) setNotice(message)
      else setError(message)
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.')
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/55 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Masuk atau daftar"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[1.35rem] leading-tight font-medium tracking-[-0.01em] text-fg">
            {mode === 'signin' ? 'Masuk' : 'Buat akun'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg-soft"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        {!configured && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
            Supabase belum dikonfigurasi. Isi <code>VITE_SUPABASE_URL</code> dan{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> di <code>.env.local</code>, lalu restart dev server.
          </p>
        )}

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1 text-sm">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m)
                setError(null)
                setNotice(null)
              }}
              className={`rounded-lg px-3 py-2 transition-colors ${
                mode === m
                  ? 'bg-flame-500 font-semibold text-on-accent'
                  : 'text-fg-muted hover:text-fg-soft'
              }`}
            >
              {m === 'signin' ? 'Masuk' : 'Daftar'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-fg-muted">Nama (opsional)</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={FIELD}
                autoComplete="name"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fg-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fg-muted">Kata sandi</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-xl border border-flame-300/30 bg-flame-100 p-3 text-xs text-flame-200">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !configured}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-flame-500 px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-fg-faint disabled:ring-1 disabled:ring-inset disabled:ring-line"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === 'signin' ? 'Masuk' : 'Buat akun'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-fg-faint">
          <span className="h-px flex-1 bg-line" />
          atau
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={busy || !configured}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-2 bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg-soft transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:text-fg-faint disabled:ring-1 disabled:ring-inset disabled:ring-line"
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z"
            />
            <path fill="#FBBC05" d="M5.4 14.3a7.1 7.1 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
            <path
              fill="#EA4335"
              d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"
            />
          </svg>
          Lanjut dengan Google
        </button>
      </div>
    </div>
  )
}
