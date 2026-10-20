import { ArrowUpRight } from './Icons'
import { usePreviewActions } from './PreviewActions'

export function ClosingCTA() {
  const { openUpload } = usePreviewActions()

  return (
    <section aria-labelledby="closing-heading" className="bg-cream">
      <div className="shell pb-16 pt-4 md:pb-20 md:pt-8">
        <div className="on-dark relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-cream sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full opacity-[0.14]"
            style={{
              background: 'radial-gradient(circle, #EED99E 0%, rgba(238,217,158,0) 68%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-[20rem] w-[20rem] rounded-full opacity-[0.10]"
            style={{
              background: 'radial-gradient(circle, #A8B49A 0%, rgba(168,180,154,0) 70%)',
            }}
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
            <div className="max-w-[40rem]">
              <p className="inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-cream/55">
                <span className="h-px w-6 bg-cream/40" />
                Mulai hari ini
              </p>
              <h2
                id="closing-heading"
                className="mt-5 text-[clamp(2.1rem,5.2vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
              >
                Nggak perlu bingung.
                <br />
                Mulai dari{' '}
                <span className="accent-serif font-normal text-butter">yang ada.</span>
              </h2>
              <p className="mt-5 max-w-[30rem] text-[0.9375rem] leading-[1.7] text-cream/70 sm:text-base">
                Buka kulkasmu, temukan kemungkinan baru, dan mulai memasak.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <button
                type="button"
                onClick={openUpload}
                className="btn btn-primary w-full justify-center sm:w-auto"
              >
                Coba dari foto
                <ArrowUpRight className="btn-arrow h-[1.05rem] w-[1.05rem]" />
              </button>
              <p className="text-[0.6875rem] text-cream/45">
                Prototipe · analisis AI belum aktif
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
