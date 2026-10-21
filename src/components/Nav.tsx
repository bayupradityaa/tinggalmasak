import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import AuthBar from './AuthBar'
import Brand from './Brand'

const LINKS = [
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#aplikasi', label: 'Aplikasi' },
  { href: '#privasi', label: 'Privasi' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [open, setOpen] = useState(false)

  // Tutup menu saat kembali ke layout desktop.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const sync = () => mq.matches && setOpen(false)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Tutup menu saat tekan Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" aria-label="Lethimcook.ai — beranda">
          <Brand />
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <AuthBar onOpenAuth={onOpenAuth} />
          </div>
          <a
            href="/dashboard"
            className="hidden rounded-full bg-flame-500 px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 sm:inline-flex"
          >
            Mulai analisis
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="grid size-10 place-items-center rounded-xl border border-line bg-surface-2 text-fg-soft transition-colors hover:bg-surface-3 md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="menu-mobile"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-canvas shadow-lg md:hidden"
        >
          <ul className="px-5 py-3 sm:px-8">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-sm text-fg-soft transition-colors hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:px-8">
            <AuthBar onOpenAuth={onOpenAuth} />
            <a
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-flame-500 px-4 py-2.5 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450"
            >
              Mulai analisis
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
