import { Camera, ChefHat, ScanSearch } from 'lucide-react'
import stepsImage from '../assets/steps-grill.webp'
import IconTile from './Icon'

const STEPS = [
  {
    icon: Camera,
    title: 'Foto isi kulkas',
    body: 'Ambil satu foto dari atas dengan pencahayaan yang cukup. Semakin jelas bahan yang terlihat, semakin akurat hasilnya.',
  },
  {
    icon: ScanSearch,
    title: 'Bahan dibaca otomatis',
    body: 'Model vision mengenali setiap bahan, memperkirakan jumlahnya, dan menandai tingkat keyakinan tiap item.',
  },
  {
    icon: ChefHat,
    title: 'Lima menu siap dimasak',
    body: 'Setiap menu memuat bahan yang dipakai, bahan tambahan yang perlu dibeli, langkah memasak, dan catatan koki.',
  },
]

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">Cara kerja</p>
            <h2 className="display-2 mt-3">Tiga langkah, satu foto.</h2>
          </div>
          <p data-reveal className="lede measure lg:pb-2">
            Tidak perlu mencatat isi kulkas atau menyusun daftar belanja. Ambil foto, dan sistem
            menyusun menu dari bahan yang tersedia.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 lg:grid-cols-3" data-reveal-group>
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              data-reveal-item
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-2 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <IconTile icon={step.icon} size="lg" />
                <span className="font-display text-sm font-medium tracking-[0.18em] text-flame-600/45 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="heading-3 mt-6 text-[1.0625rem]">{step.title}</h3>
              <p className="copy mt-2">{step.body}</p>
            </li>
          ))}
        </ol>

        <figure
          data-reveal
          className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-line bg-ink-900 shadow-card"
        >
          <img
            src={stepsImage}
            alt="Hidangan yang baru selesai dimasak, ditata di atas piring"
            width={1100}
            height={734}
            loading="lazy"
            decoding="async"
            data-parallax
            className="h-[240px] w-full scale-110 object-cover sm:h-[320px] lg:h-[420px]"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 bg-gradient-to-t from-ink-950/85 via-ink-950/45 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
            <p className="max-w-md font-display text-lg font-medium text-white sm:text-xl">
              Dari bahan yang sudah ada menjadi hidangan yang layak disajikan.
            </p>
            <p className="hidden text-xs text-white/70 sm:block">Dapur rumahan · Indonesia</p>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
