import { useMemo, useState } from 'react'
import { ArrowRight, Bowl, LayoutGrid, Sparkle, Swap, Timer } from './Icons'
import {
  MATRIX_INGREDIENTS,
  SUBSTITUTIONS,
  TIME_WINDOWS,
} from '../data/content'

function IngredientMatrix() {
  const [selected, setSelected] = useState<string[]>(['tahu', 'tomat', 'brokoli'])

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const combinations = useMemo(() => {
    const total = selected.reduce(
      (sum, id) => sum + (MATRIX_INGREDIENTS.find((item) => item.id === id)?.dishes ?? 0),
      0,
    )
    // A transparent, deterministic illustration — not a claim about live data.
    return Math.round(total * (selected.length > 1 ? 1.35 : 1))
  }, [selected])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
            <LayoutGrid className="h-3.5 w-3.5" />
            Kombinasi bahan
          </span>
          <h3 className="mt-2 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
            Pilih bahan, lihat kemungkinannya
          </h3>
        </div>
        <span className="tnum shrink-0 rounded-full bg-butter-soft px-2.5 py-1 text-[0.6875rem] font-bold text-ink">
          {combinations} ide
        </span>
      </div>

      <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted">
        Setiap bahan yang aktif membuka kombinasi masakan baru. Tidak ada yang terbuang.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {MATRIX_INGREDIENTS.map((item) => {
          const isActive = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              aria-pressed={isActive}
              className={`flex min-h-[3.25rem] flex-col items-start justify-center rounded-xl border px-2.5 py-2 text-left transition-colors ${
                isActive
                  ? 'border-ink/15 bg-sage-soft text-ink'
                  : 'border-hairline bg-cream text-muted hover:border-strong'
              }`}
            >
              <span className="text-[0.6875rem] font-semibold leading-tight">{item.label}</span>
              <span className="tnum mt-0.5 text-[0.625rem] opacity-70">{item.dishes} resep</span>
            </button>
          )
        })}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[0.6875rem]">
        <span className="text-subtle">
          <span className="tnum font-bold text-ink">{selected.length}</span> bahan aktif
        </span>
        <button
          type="button"
          onClick={() => setSelected([])}
          className="rounded font-semibold text-ink underline decoration-hairline underline-offset-2 hover:decoration-ink"
        >
          Kosongkan
        </button>
      </div>
    </div>
  )
}

function SubstitutionCard() {
  const [activeId, setActiveId] = useState(SUBSTITUTIONS[0].id)
  const active = SUBSTITUTIONS.find((item) => item.id === activeId) ?? SUBSTITUTIONS[0]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
            <Swap className="h-3.5 w-3.5" />
            Kalau ada yang kurang
          </span>
          <h3 className="mt-2 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
            Ada alternatifnya
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-tomato/15 px-2.5 py-1 text-[0.625rem] font-bold text-ink">
          tetap bisa masak
        </span>
      </div>

      <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted">
        Bahan yang tidak ada bisa diganti tanpa mengubah cara memasaknya.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SUBSTITUTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveId(item.id)}
            aria-pressed={activeId === item.id}
            className={`min-h-8 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors ${
              activeId === item.id
                ? 'border-ink/20 bg-ink text-cream'
                : 'border-hairline bg-cream text-muted hover:border-strong hover:text-ink'
            }`}
          >
            {item.missing}
          </button>
        ))}
      </div>

      <div key={active.id} className="swap-in mt-3 rounded-xl border border-hairline bg-cream p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-surface px-2 py-1 text-[0.6875rem] font-semibold text-muted line-through decoration-tomato/60">
            {active.missing}
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" />
          <span className="rounded-md bg-sage-soft px-2 py-1 text-[0.6875rem] font-bold text-ink">
            {active.alternative}
          </span>
        </div>
        <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">{active.note}</p>
      </div>

      <p className="mt-auto flex items-center gap-1.5 pt-4 text-[0.6875rem] font-medium text-subtle">
        <Sparkle className="h-3.5 w-3.5" />
        Saran pengganti, bukan aturan baku.
      </p>
    </div>
  )
}

function TimeAdjustment() {
  const [activeId, setActiveId] = useState(TIME_WINDOWS[1].id)
  const active = TIME_WINDOWS.find((item) => item.id === activeId) ?? TIME_WINDOWS[1]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
            <Timer className="h-3.5 w-3.5" />
            Sesuai waktumu
          </span>
          <h3 className="mt-2 text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">
            Masak mengikuti jadwal
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[0.625rem] font-bold text-muted ring-1 ring-hairline">
          {active.label}
        </span>
      </div>

      <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted">
        Punya 15 menit atau satu jam? Inspirasi menyesuaikan waktu yang kamu punya.
      </p>

      <div className="mt-4">
        <div className="relative h-1.5 rounded-full bg-cream-deep">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-tomato/70 transition-[width] duration-300"
            style={{
              width:
                active.id === 'cepat' ? '34%' : active.id === 'sedang' ? '67%' : '100%',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-between">
            {TIME_WINDOWS.map((item) => {
              const isActive = item.id === activeId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={isActive}
                  aria-label={`Waktu ${item.label}`}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isActive
                      ? 'scale-110 border-ink bg-surface'
                      : 'border-transparent bg-surface ring-1 ring-strong'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? 'bg-tomato' : 'bg-strong'}`}
                  />
                </button>
              )
            })}
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[0.625rem] font-semibold text-subtle">
          {TIME_WINDOWS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              aria-pressed={activeId === item.id}
              className={`rounded px-0.5 transition-colors ${
                activeId === item.id ? 'text-ink' : 'hover:text-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div key={active.id} className="swap-in mt-3 rounded-xl border border-hairline bg-cream p-3">
        <ul className="space-y-1">
          {active.ideas.map((idea) => (
            <li key={idea} className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink">
              <Bowl className="h-3.5 w-3.5 shrink-0 text-subtle" />
              {idea}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">{active.note}</p>
      </div>

      <p className="mt-auto pt-4 text-[0.6875rem] font-medium text-subtle">
        Waktu memasak adalah estimasi, bukan janji.
      </p>
    </div>
  )
}

export function Benefits() {
  return (
    <section id="tentang" aria-labelledby="tentang-heading" className="border-t border-hairline bg-cream">
      <div className="shell py-20 md:py-24 lg:py-28">
        <div className="max-w-[42rem]">
          <p className="eyebrow reveal">Tentang</p>
          <h2
            id="tentang-heading"
            className="reveal mt-4 text-[clamp(2rem,4.4vw,3.15rem)] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink"
            style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
          >
            Masak lebih mudah,
            <br className="hidden sm:block" /> mulai dari{' '}
            <span className="accent-serif font-normal">yang ada.</span>
          </h2>
          <p
            className="reveal mt-5 max-w-[34rem] text-[0.9375rem] leading-[1.7] text-muted sm:text-base"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            Bukan tentang belanja lebih banyak. Lethimcook membantu kamu melihat apa yang sudah
            ada di dapur sebagai bahan untuk sesuatu yang enak.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-[1.15fr_0.92fr_0.92fr] lg:gap-5">
          <article className="reveal rounded-[1.75rem] border border-hairline bg-surface p-5 shadow-soft sm:p-6">
            <IngredientMatrix />
          </article>
          <article
            className="reveal rounded-[1.75rem] border border-hairline bg-surface p-5 shadow-soft sm:p-6"
            style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
          >
            <SubstitutionCard />
          </article>
          <article
            className="reveal rounded-[1.75rem] border border-hairline bg-surface p-5 shadow-soft sm:p-6 md:col-span-2 lg:col-span-1"
            style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
          >
            <TimeAdjustment />
          </article>
        </div>

        <div className="reveal mt-5 flex flex-col gap-4 rounded-[1.75rem] border border-hairline bg-cream-deep/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="max-w-[44rem] text-[0.875rem] leading-[1.65] text-muted">
            <span className="font-semibold text-ink">Dibuat untuk dapur sehari-hari.</span> Tanpa
            klaim angka pengguna, tanpa rating karangan. Hanya alat bantu untuk memakai bahan yang
            sudah kamu punya.
          </p>
          <a
            href="#cara-kerja"
            className="inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] font-semibold text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-ink"
          >
            Lihat alurnya
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
