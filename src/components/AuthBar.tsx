import { LogIn, LogOut, User } from 'lucide-react'
import { useAuth } from '../auth/auth-context'

export default function AuthBar({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { user, profile, signOut, loading, configured } = useAuth()

  if (loading) {
    return <span className="text-xs text-neutral-600">memuat...</span>
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        disabled={!configured}
        className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-40"
      >
        <LogIn className="size-3.5" />
        Masuk
      </button>
    )
  }

  const name = profile?.display_name || user.email

  return (
    <div className="flex items-center gap-2">
      <span className="flex max-w-[12rem] items-center gap-1.5 truncate rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/15">
        <User className="size-3.5 shrink-0" />
        <span className="truncate">{name}</span>
      </span>
      <button
        type="button"
        onClick={() => void signOut()}
        className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-neutral-400 ring-1 ring-white/10 transition hover:text-white"
      >
        <LogOut className="size-3.5" />
        Keluar
      </button>
    </div>
  )
}
