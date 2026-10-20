import { useId, useMemo, useState } from 'react'
import { ArrowDown, ArrowUpRight, Eye, EyeOff, Leaf } from './Icons'
import { FridgeImage } from './FridgeImage'
import { usePreviewActions } from './PreviewActions'
import { FRIDGE_PINS } from '../data/content'

export function Hero() {
  const { openUpload } = usePreviewActions()
  const [activePin, setActivePin] = useState(FRIDGE_PINS[0].id)
  const [pinsVisible, setPinsVisible] = useState(true)
  const helpId = useId()

  const active = useMemo(
    () => FRIDGE_PINS.find((pin) => pin.id === activePin) ?? FRIDGE_PINS[0],
    [activePin],
  )

  return (
    <section id="top" aria-labelledby="hero-heading" className="relative">
      <div className="shell grid items-center gap-y-12 pb-16 pt-10 md:gap-y-14 md:pb-20 md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-x-10 lg:pb-24 lg:pt-10 xl:gap-x-16">
        <div className="max-w-[36rem] lg:max-w-[34rem] xl:max-w-[37rem]">
          <p className="eyebrow reveal">Less waste. More taste.</p>

          <h1
            id="hero-heading"
            className="reveal mt-5 text-[clamp(2.55rem,7.6vw,4.4rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink"
            style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
          >
            Ada isi kulkas?
            <br />
            Ada <span className="accent-serif font-normal text-ink">ide masakan.</span>
          </h1>

          <p
            className="reveal mt-6 max-w-[30rem] text-[1.0625rem] leading-[1.65] text-muted sm:text-lg"
            style={{ '--reveal-delay': '120ms' } as React.CSSProperties}
          >
            Foto bahan yang kamu punya. Temukan masakan yang bisa kamu buat hari ini.
          </p>

          <div
            className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
          >
            <button type="button" onClick={openUpload} className="btn btn-primary">
              Coba dari foto
              <ArrowUpRight className="btn-arrow h-[1.05rem] w-[1.05rem]" />
            </button>
            <a href="#cara-kerja" className="btn btn-secondary">
              Lihat cara kerja
              <ArrowDown className="btn-arrow-down h-[1.05rem] w-[1.05rem]" />
            </a>
          </div>

          <p
            className="reveal mt-5 flex items-center gap-2 text-[0.8125rem] font-medium text-subtle"
            style={{ '--reveal-delay': '240ms' } as React.CSSProperties}
          >
            <Leaf className="h-4 w-4 text-sage" />
            Mulai dari bahan yang sudah kamu punya.
          </p>
        </div>

        <div
          className="reveal relative mx-auto w-full max-w-[30rem] sm:max-w-[34rem] lg:max-w-none"
          style={{ '--reveal-delay': '160ms' } as React.CSSProperties}
        >
          <div className="relative isolate">
            {/* Soft floor shadow directly beneath the appliance */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[2%] left-1/2 -z-10 h-[7%] w-[78%] -translate-x-1/2 rounded-[50%]"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(45,48,40,0.20) 0%, rgba(45,48,40,0.09) 45%, rgba(45,48,40,0) 72%)',
                filter: 'blur(6px)',
              }}
            />

            <FridgeImage
              className="relative mx-auto w-full max-w-[26rem] sm:max-w-[29rem] lg:max-w-[31rem] xl:max-w-[34rem]"
              alt="Kulkas French-door dua pintu yang terisi penuh bahan makanan segar: telur, sayuran, buah, dan botol minuman."
            />

            <div className="absolute inset-0 mx-auto w-full max-w-[26rem] sm:max-w-[29rem] lg:max-w-[31rem] xl:max-w-[34rem]">
              {FRIDGE_PINS.map((pin, index) => {
                const isActive = pinsVisible && pin.id === activePin
                return (
                  <div
                    key={pin.id}
                    className={`absolute transition-opacity duration-300 ${
                      pinsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isActive ? 20 : 10,
                    }}
                    aria-hidden={!pinsVisible}
                  >
                    <button
                      type="button"
                      onClick={() => setActivePin(pin.id)}
                      aria-pressed={pin.id === activePin}
                      aria-describedby={helpId}
                      className={`group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 transition-all duration-200 ${
                        pin.side === 'left' ? 'flex-row-reverse pr-1 pl-3.5' : ''
                      } ${
                        isActive
                          ? 'bg-ink text-cream shadow-elevated'
                          : 'bg-surface/95 text-ink shadow-soft ring-1 ring-hairline hover:bg-surface'
                      }`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <span
                        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                          isActive ? 'bg-tomato' : 'bg-sage-soft'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-ink' : 'bg-ink/60'}`}
                        />
                        {!isActive && (
                          <span className="absolute inset-0 rounded-full ring-1 ring-ink/10" />
                        )}
                      </span>
                      <span className="flex flex-col items-start leading-tight">
                        <span className="text-[0.6875rem] font-bold tracking-[0.01em]">
                          {pin.label}
                        </span>
                        <span
                          className={`text-[0.625rem] font-medium ${
                            isActive ? 'text-cream/65' : 'text-subtle'
                          }`}
                        >
                          {pin.detail}
                        </span>
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 px-1">
            <p id={helpId} className="text-[0.6875rem] leading-relaxed text-subtle">
              Klik label untuk melihat bahan yang terhubung ke resep.
            </p>
            <button
              type="button"
              onClick={() => setPinsVisible((value) => !value)}
              aria-pressed={!pinsVisible}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-hairline bg-surface/70 px-3 py-1.5 text-[0.6875rem] font-semibold text-muted transition-colors hover:border-strong hover:text-ink"
            >
              {pinsVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {pinsVisible ? 'Sembunyikan label' : 'Tampilkan label'}
            </button>
          </div>

          <div
            aria-live="polite"
            className="mt-4 rounded-2xl border border-hairline bg-surface p-4 shadow-soft sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em] text-subtle">
                Bahan → resep
              </span>
              <span className="rounded-full bg-sage-soft px-2.5 py-1 text-[0.625rem] font-semibold text-ink">
                {pinsVisible ? active.detail : 'Label disembunyikan'}
              </span>
            </div>
            <p key={active.id} className="swap-in mt-2 text-[0.9375rem] font-semibold text-ink">
              {active.label}
            </p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {active.recipes.map((recipe) => (
                <li
                  key={recipe}
                  className="rounded-full border border-hairline bg-cream px-2.5 py-1 text-[0.6875rem] font-medium text-muted"
                >
                  {recipe}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
