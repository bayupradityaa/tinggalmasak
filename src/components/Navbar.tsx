import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Close, Menu } from './Icons'
import { usePreviewActions } from './PreviewActions'
import { NAV_LINKS } from '../data/content'

export function Navbar() {
  const { openUpload, openLogin } = usePreviewActions()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const media = window.matchMedia('(min-width: 900px)')
    const onChange = () => setOpen(false)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [open])

  const handleUpload = () => {
    setOpen(false)
    openUpload()
  }

  const handleLogin = () => {
    setOpen(false)
    openLogin()
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-hairline bg-cream/92 shadow-[0_1px_0_rgba(45,48,40,0.04)] backdrop-blur-md'
          : 'border-transparent bg-cream'
      }`}
    >
      <div className="shell flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        <a
          href="#top"
          className="group -ml-1 flex shrink-0 items-center gap-2 rounded-md px-1 py-2 text-[1.28rem] font-extrabold tracking-[-0.035em] text-ink"
          aria-label="Lethimcook — kembali ke atas"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-ink text-cream">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
              <path
                d="M4 10.5h16a8 8 0 0 1-16 0Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M9 6.6c0-1.3 1.1-2.1 3-2.1s3 .8 3 2.1"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            lethimcook<span className="text-tomato">.</span>
          </span>
        </a>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[0.875rem] font-medium text-muted transition-colors hover:bg-cream-deep hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <button
            type="button"
            onClick={openLogin}
            className="rounded-full px-3.5 py-2 text-[0.875rem] font-semibold text-ink transition-colors hover:bg-cream-deep"
          >
            Login
          </button>
          <button type="button" onClick={openUpload} className="btn btn-primary btn-sm">
            Coba dari foto
            <ArrowUpRight className="btn-arrow h-4 w-4" />
          </button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-strong text-ink transition-colors hover:bg-cream-deep lg:hidden"
        >
          {open ? <Close className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-hairline bg-cream lg:hidden"
      >
        <div className="shell flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-xl px-3 text-[0.9375rem] font-medium text-ink transition-colors hover:bg-cream-deep"
            >
              {link.label}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-subtle"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-hairline pt-4">
            <button type="button" onClick={handleLogin} className="btn btn-secondary w-full">
              Login
            </button>
            <button type="button" onClick={handleUpload} className="btn btn-primary w-full">
              Coba dari foto
              <ArrowUpRight className="btn-arrow h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
