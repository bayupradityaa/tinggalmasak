import { useMemo, useState } from 'react'
import { ChefHat, Clock, Info, Minus, Plus, Users } from './Icons'
import { Ticker } from '../lib/Ticker'
import { RECIPE } from '../data/content'

function formatAmount(value: number, whole?: boolean) {
  if (value === 0) return null
  const rounded = whole ? Math.round(value) : Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function RecipePreview() {
  const [portions, setPortions] = useState(2)
  const factor = portions / RECIPE.meta.servings

  const available = useMemo(
    () =>
      RECIPE.available.map((item) => ({
        ...item,
        amount: formatAmount(item.base * factor, item.whole),
      })),
    [factor],
  )

  const extra = useMemo(
    () =>
      RECIPE.extra.map((item) => ({
        ...item,
        amount: formatAmount(item.base * factor, item.whole),
      })),
    [factor],
  )

  return (
    <section
      id="inspirasi-masakan"
      aria-labelledby="inspirasi-heading"
      className="border-t border-hairline bg-cream-deep/45"
    >
      <div className="shell py-20 md:py-24 lg:py-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[38rem]">
            <p className="eyebrow reveal">Inspirasi masakan</p>
            <h2
              id="inspirasi-heading"
              className="reveal mt-4 text-[clamp(2rem,4.4vw,3.15rem)] font-extrabold leading-[1.03] tracking-[-0.04em] text-ink"
              style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
            >
              Bahan sederhana,
              <br className="hidden sm:block" /> banyak{' '}
              <span className="accent-serif font-normal">kemungkinan.</span>
            </h2>
          </div>
          <div
            className="reveal flex items-center gap-2 self-start rounded-full border border-ink/10 bg-butter-soft px-3.5 py-2 lg:mb-2"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            <Info className="h-4 w-4 shrink-0 text-ink/70" />
            <span className="text-[0.75rem] font-semibold text-ink">
              Contoh hasil <span className="font-medium text-ink/60">· Ilustrasi Demo</span>
            </span>
          </div>
        </div>

        <div className="recipe-curtain reveal-group mt-10 overflow-hidden rounded-[1.75rem] border border-hairline bg-surface shadow-soft lg:mt-12">
          <div className="curtain-unscale">
            <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            {/* Recipe header + ingredients */}
            <div className="border-b border-hairline p-5 sm:p-7 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink">
                    <ChefHat className="h-3.5 w-3.5" />
                    Resep demo
                  </span>
                  <h3 className="mt-3 text-[clamp(1.5rem,2.4vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em] text-ink">
                    {RECIPE.title}
                  </h3>
                  <p className="mt-2 max-w-[26rem] text-[0.875rem] leading-[1.65] text-muted">
                    {RECIPE.description}
                  </p>
                </div>

                <div
                  className="flex items-center gap-1 rounded-full border border-hairline bg-cream p-1"
                  role="group"
                  aria-label="Jumlah porsi"
                >
                  {[2, 4].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPortions(value)}
                      aria-pressed={portions === value}
                      className={`min-h-8 rounded-full px-3 text-[0.75rem] font-semibold transition-colors ${
                        portions === value
                          ? 'bg-ink text-cream shadow-sm'
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      {value} porsi
                    </button>
                  ))}
                </div>
              </div>

              <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-hairline py-3 text-[0.75rem] font-medium text-muted">
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Waktu memasak</dt>
                  <Clock className="h-4 w-4 text-subtle" />
                  <dd>{RECIPE.meta.time}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Tingkat kesulitan</dt>
                  <ChefHat className="h-4 w-4 text-subtle" />
                  <dd>{RECIPE.meta.difficulty}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Porsi</dt>
                  <Users className="h-4 w-4 text-subtle" />
                  <dd className="tnum">
                    <Ticker value={portions} />
                    &nbsp;porsi
                  </dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                      Sudah ada di kulkas
                    </h4>
                    <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[0.625rem] font-bold text-ink">
                      {available.length}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-0.5">
                    {available.map((item, index) => (
                      <li
                        key={item.name}
                        className="flex items-baseline justify-between gap-2 border-b border-hairline/70 py-1.5 last:border-0"
                      >
                        <span className="text-[0.8125rem] text-ink">{item.name}</span>
                        <span className="tnum shrink-0 text-[0.8125rem] font-semibold text-ink/75">
                          <Ticker value={`${item.amount} ${item.unit}`} delay={index * 25} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                      Bahan tambahan
                    </h4>
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[0.625rem] font-bold text-muted">
                      {extra.length}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-0.5">
                    {extra.map((item, index) => (
                      <li
                        key={item.name}
                        className="flex items-baseline justify-between gap-2 border-b border-hairline/70 py-1.5 last:border-0"
                      >
                        <span className="text-[0.8125rem] text-muted">{item.name}</span>
                        <span className="tnum shrink-0 text-[0.8125rem] font-medium text-muted">
                          {item.amount ? (
                            <Ticker value={`${item.amount} ${item.unit}`} delay={index * 25} />
                          ) : (
                            item.unit
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-4 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-subtle">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Takaran menyesuaikan porsi. Angka dibulatkan agar mudah ditakar di dapur.
              </p>
            </div>

            {/* Steps */}
            <div className="flex flex-col p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <h4 className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                  Langkah memasak
                </h4>
                <span className="text-[0.6875rem] font-medium text-subtle">
                  {RECIPE.steps.length} langkah
                </span>
              </div>

              <ol className="mt-4 flex-1 space-y-4">
                {RECIPE.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span className="tnum flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-cream text-[0.75rem] font-bold text-ink">
                      {index + 1}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[0.875rem] font-semibold text-ink">{step.title}</p>
                      <p className="mt-1 text-[0.8125rem] leading-[1.65] text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl border border-hairline bg-cream p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-subtle">
                    Ringkasan porsi
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPortions(2)}
                      disabled={portions === 2}
                      aria-label="Kurangi ke 2 porsi"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-strong text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="tnum w-10 text-center text-[0.75rem] font-bold text-ink">
                      <Ticker value={portions} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setPortions(4)}
                      disabled={portions === 4}
                      aria-label="Tambah ke 4 porsi"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-strong text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
                  {portions === 2
                    ? 'Takaran dasar untuk dua orang. Cocok untuk makan malam berdua.'
                    : 'Takaran digandakan untuk empat orang, termasuk bahan tambahan.'}
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}
