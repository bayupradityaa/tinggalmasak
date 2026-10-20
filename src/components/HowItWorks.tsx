import { useMemo, useState } from 'react'
import { ArrowRight, Camera, Check, Clock, Refrigerator, Sparkle } from './Icons'
import { DETECTED_INGREDIENTS } from '../data/content'

const RECIPE_MATCHES = [
  {
    id: 'tumis-tahu',
    title: 'Tumis tahu sayuran',
    time: '20 menit',
    needs: ['tahu', 'tomat', 'brokoli', 'wortel', 'bawang'],
  },
  {
    id: 'telur-dadar',
    title: 'Telur dadar sayur',
    time: '10 menit',
    needs: ['telur', 'wortel', 'bawang', 'daun-bawang'],
  },
  {
    id: 'capcay',
    title: 'Capcay rumahan',
    time: '25 menit',
    needs: ['brokoli', 'wortel', 'bawang', 'tahu'],
  },
  {
    id: 'sambal-tomat',
    title: 'Sambal tomat segar',
    time: '8 menit',
    needs: ['tomat', 'cabai', 'bawang'],
  },
]

export function HowItWorks() {
  const [activeIds, setActiveIds] = useState<string[]>(
    DETECTED_INGREDIENTS.filter((item) => item.defaultActive).map((item) => item.id),
  )

  const toggle = (id: string) => {
    setActiveIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const ranked = useMemo(() => {
    return RECIPE_MATCHES.map((recipe) => {
      const matched = recipe.needs.filter((need) => activeIds.includes(need)).length
      return { ...recipe, matched, total: recipe.needs.length }
    }).sort((a, b) => b.matched - a.matched || a.time.localeCompare(b.time))
  }, [activeIds])

  const best = ranked[0]
  const fullMatches = ranked.filter((recipe) => recipe.matched === recipe.total).length

  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-heading" className="border-t border-hairline bg-cream">
      <div className="shell py-20 md:py-24 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[38rem]">
            <p className="eyebrow reveal">Cara kerja</p>
            <h2
              id="cara-kerja-heading"
              className="reveal mt-4 text-[clamp(2rem,4.4vw,3.15rem)] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink"
              style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
            >
              Dari isi kulkas,
              <br className="hidden sm:block" /> jadi{' '}
              <span className="accent-serif font-normal">ide makan.</span>
            </h2>
          </div>
          <p
            className="reveal max-w-[22rem] text-[0.9375rem] leading-[1.65] text-muted md:pb-1.5"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            Tiga langkah sederhana. Kamu tetap memegang kendali atas bahan yang dipakai.
          </p>
        </div>

        <div className="relative mt-12 md:mt-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[1.4rem] hidden h-px md:block"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(45,48,40,0.22) 0 6px, transparent 6px 12px)',
              backgroundSize: '12px 1px',
            }}
          />

          <div className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
            {/* Stage 01 */}
            <article className="reveal relative flex flex-col">
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface text-[0.75rem] font-bold text-ink shadow-soft">
                  01
                </span>
                <span className="h-px flex-1 bg-hairline md:hidden" />
              </div>

              <h3 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
                Foto bahanmu
              </h3>
              <p className="mt-1.5 max-w-[19rem] text-[0.875rem] leading-[1.6] text-muted">
                Mulai dengan foto isi kulkas atau bahan yang tersedia.
              </p>

              <div className="mt-5 rounded-2xl border border-hairline bg-surface p-3 shadow-soft">
                <div
                  className="relative overflow-hidden rounded-xl border border-dashed border-strong/70"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 20%, rgba(238,217,158,0.35), transparent 62%), var(--bg-cream-deep)',
                  }}
                >
                  <svg
                    viewBox="0 0 280 150"
                    className="h-auto w-full"
                    role="img"
                    aria-label="Ilustrasi foto bahan makanan di atas meja dapur"
                  >
                    <g
                      fill="none"
                      stroke="#2D3028"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.85"
                    >
                      {/* camera frame corners */}
                      <path d="M18 34V22h12" />
                      <path d="M250 34V22h-12" />
                      <path d="M18 116v12h12" />
                      <path d="M250 116v12h-12" />
                      {/* table line */}
                      <path d="M40 112h200" opacity="0.35" />
                      {/* bowl */}
                      <path d="M86 92h108a54 54 0 0 1-108 0Z" />
                      <path d="M80 92h120" />
                      <path d="M118 122h44" opacity="0.5" />
                      {/* tomato */}
                      <circle cx="120" cy="84" r="10" fill="#E87559" stroke="none" />
                      <path d="M120 74c2-3 5-4 7-4" />
                      {/* broccoli */}
                      <circle cx="145" cy="78" r="7" fill="#A8B49A" stroke="none" />
                      <circle cx="154" cy="84" r="6" fill="#A8B49A" stroke="none" />
                      <circle cx="139" cy="85" r="5.5" fill="#A8B49A" stroke="none" />
                      <path d="M147 84v9" />
                      {/* egg */}
                      <ellipse cx="172" cy="86" rx="11" ry="8" fill="#FAF2DA" />
                      <ellipse cx="172" cy="86" rx="4.5" ry="3.2" fill="#EED99E" stroke="none" />
                      {/* carrot */}
                      <path d="M95 82c6-5 14-4 17 2l-10 8-7-10Z" fill="#E87559" stroke="none" />
                      <path d="M112 84c2-3 4-4 7-4" />
                      {/* steam */}
                      <path d="M132 60c3-4 0-7 3-11" opacity="0.4" />
                      <path d="M152 57c3-4 0-7 3-11" opacity="0.4" />
                      {/* phone capture button hint */}
                      <circle cx="140" cy="136" r="5" opacity="0.5" />
                    </g>
                  </svg>
                  <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-[0.625rem] font-semibold text-ink shadow-sm">
                    <Camera className="h-3 w-3" />
                    foto isi kulkas
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between px-0.5">
                  <span className="text-[0.6875rem] font-medium text-subtle">1 foto · JPG/PNG</span>
                  <span className="rounded-full bg-butter-soft px-2 py-0.5 text-[0.625rem] font-semibold text-ink">
                    contoh
                  </span>
                </div>
              </div>
            </article>

            {/* Stage 02 */}
            <article className="reveal relative flex flex-col" style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface text-[0.75rem] font-bold text-ink shadow-soft">
                  02
                </span>
                <span className="h-px flex-1 bg-hairline md:hidden" />
              </div>

              <h3 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
                Kenali bahan
              </h3>
              <p className="mt-1.5 max-w-[19rem] text-[0.875rem] leading-[1.6] text-muted">
                Lihat bahan yang terdeteksi dan koreksi jika diperlukan.
              </p>

              <div className="mt-5 flex flex-1 flex-col rounded-2xl border border-hairline bg-surface p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                    Terdeteksi
                  </span>
                  <span className="tnum rounded-full bg-sage-soft px-2 py-0.5 text-[0.625rem] font-semibold text-ink">
                    {activeIds.length}/{DETECTED_INGREDIENTS.length} aktif
                  </span>
                </div>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {DETECTED_INGREDIENTS.map((item) => {
                    const isActive = activeIds.includes(item.id)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-pressed={isActive}
                          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[0.75rem] font-semibold transition-colors ${
                            isActive
                              ? 'border-ink/15 bg-ink text-cream'
                              : 'border-hairline bg-cream text-muted hover:border-strong hover:text-ink'
                          }`}
                        >
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                              isActive ? 'bg-tomato text-ink' : 'border border-strong text-transparent'
                            }`}
                          >
                            <Check className="h-2.5 w-2.5" />
                          </span>
                          {item.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-hairline pt-3 text-[0.6875rem] text-subtle">
                  <span>Ketuk untuk aktif / nonaktif</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIds(
                        DETECTED_INGREDIENTS.filter((item) => item.defaultActive).map(
                          (item) => item.id,
                        ),
                      )
                    }
                    className="rounded font-semibold text-ink underline decoration-hairline decoration-1 underline-offset-2 transition-colors hover:decoration-ink"
                  >
                    Atur ulang
                  </button>
                </div>
              </div>
            </article>

            {/* Stage 03 */}
            <article className="reveal relative flex flex-col" style={{ '--reveal-delay': '180ms' } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface text-[0.75rem] font-bold text-ink shadow-soft">
                  03
                </span>
                <span className="h-px flex-1 bg-hairline md:hidden" />
              </div>

              <h3 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
                Temukan resep
              </h3>
              <p className="mt-1.5 max-w-[19rem] text-[0.875rem] leading-[1.6] text-muted">
                Dapatkan inspirasi masakan lengkap dengan bahan dan langkah memasak.
              </p>

              <div className="mt-5 flex flex-1 flex-col rounded-2xl border border-hairline bg-surface p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                    Cocok untukmu
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-butter-soft px-2 py-0.5 text-[0.625rem] font-semibold text-ink">
                    <Sparkle className="h-3 w-3" />
                    {fullMatches > 0 ? `${fullMatches} pas` : 'sebagian'}
                  </span>
                </div>

                <p className="mt-3 text-[0.8125rem] leading-snug text-muted">
                  <span className="tnum font-bold text-ink">{best.matched}</span> dari {best.total}{' '}
                  bahan untuk{' '}
                  <span className="font-semibold text-ink">{best.title.toLowerCase()}</span>{' '}
                  sudah kamu punya.
                </p>

                <ul className="mt-3 space-y-1.5">
                  {ranked.slice(0, 3).map((recipe, index) => {
                    const percent = Math.round((recipe.matched / recipe.total) * 100)
                    return (
                      <li
                        key={recipe.id}
                        className={`rounded-xl border px-2.5 py-2 ${
                          index === 0 ? 'border-ink/15 bg-cream' : 'border-hairline bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[0.75rem] font-semibold text-ink">
                            {recipe.title}
                          </span>
                          <span className="tnum shrink-0 text-[0.625rem] font-semibold text-muted">
                            {recipe.matched}/{recipe.total}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="h-1 flex-1 overflow-hidden rounded-full bg-cream-deep">
                            <span
                              className="block h-full rounded-full bg-sage transition-[width] duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-[0.625rem] text-subtle">
                            <Clock className="h-3 w-3" />
                            {recipe.time}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <p className="mt-auto flex items-center gap-1.5 pt-3 text-[0.6875rem] font-medium text-subtle">
                  <Refrigerator className="h-3.5 w-3.5" />
                  Hasil menyesuaikan bahan aktif
                  <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
