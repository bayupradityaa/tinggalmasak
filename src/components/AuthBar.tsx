import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../auth/auth-context'

export default function AuthBar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, profile, signOut, loading, configured } = useAuth()

  if (loading) {
    return <span className="text-xs text-fg-faint">memuat...</span>
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        disabled={!configured}
        className="flex items-center gap-1.5 rounded-full border border-line-2 bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-fg-soft transition-colors hover:bg-surface-3 disabled:opacity-55"
      >
        <LogIn className="size-3.5" />
        Masuk
      </button>
    )
  }

  const name = profile?.display_name || user.email

  return (
    <div className="flex items-center gap-2">
      <a
        href="/dashboard"
        className="flex max-w-[11rem] items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-xs text-fg-soft transition-colors hover:border-line-2"
      >
        <User className="size-3.5 shrink-0 text-flame-300" />
        <span className="truncate">{name}</span>
      </a>
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg-soft"
      >
        <LogOut className="size-3.5" />
        Keluar
      </button>
    </div>
  )
}
