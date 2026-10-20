import { NAV_LINKS } from '../data/content'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-cream">
      <div className="shell py-10 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-[22rem]">
            <a
              href="#top"
              className="-ml-1 inline-flex items-center gap-2 rounded-md px-1 py-1 text-[1.05rem] font-extrabold tracking-[-0.035em] text-ink"
            >
              lethimcook<span className="text-tomato">.</span>
            </a>
            <p className="mt-3 text-[0.8125rem] leading-[1.65] text-muted">
              Asisten dapur untuk mengubah bahan yang sudah ada menjadi ide masakan. Good food
              starts at home.
            </p>
          </div>

          <nav aria-label="Navigasi footer" className="flex flex-wrap gap-x-8 gap-y-3">
            <ul className="flex flex-col gap-2">
              <li className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
                Jelajahi
              </li>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-6 items-center rounded text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-2">
              <li className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
                Produk
              </li>
              <li>
                <a
                  href="#top"
                  className="inline-flex min-h-6 items-center rounded text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                >
                  Halaman utama
                </a>
              </li>
              <li>
                <a
                  href="#inspirasi-masakan"
                  className="inline-flex min-h-6 items-center rounded text-[0.8125rem] font-medium text-muted transition-colors hover:text-ink"
                >
                  Contoh resep
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] text-subtle">
            © <span className="tnum">{YEAR}</span> Lethimcook. Prototipe preview.
          </p>
          <p className="text-[0.75rem] text-subtle">
            dibuat untuk dapur rumahan
          </p>
        </div>
      </div>
    </footer>
  )
}
