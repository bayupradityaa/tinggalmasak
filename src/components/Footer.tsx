import Brand from './Brand'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-2">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Brand />
          <p className="copy-sm mt-3 max-w-sm">
            Foto isi kulkas, lima menu siap masak. Dapur rumahan Indonesia, dibantu AI yang membaca
            bahan alih-alih menebak.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-muted">
          <a href="#cara-kerja" className="transition-colors hover:text-fg-soft">
            Cara kerja
          </a>
          <a href="#fitur" className="transition-colors hover:text-fg-soft">
            Fitur
          </a>
          <a href="#privasi" className="transition-colors hover:text-fg-soft">
            Privasi
          </a>
          <a href="#faq" className="transition-colors hover:text-fg-soft">
            FAQ
          </a>
          <a href="/dashboard" className="transition-colors hover:text-fg-soft">
            Dashboard
          </a>
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-fg-faint sm:px-8">
          © {YEAR} Lethimcook.ai · Dibuat di Indonesia
        </p>
      </div>
    </footer>
  )
}
