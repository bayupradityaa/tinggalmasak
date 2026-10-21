import type { CSSProperties } from 'react'
import { ArrowRight, Camera, Clock, ShieldCheck } from 'lucide-react'
import fridgeImage from '../assets/fridge-cutout.webp'
import Magnetic from './Magnetic'

const TRUST = [
  { icon: Camera, label: 'Satu foto per analisis' },
  { icon: Clock, label: 'Selesai dalam 15–30 detik' },
  { icon: ShieldCheck, label: 'Foto tidak dibagikan' },
]

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 pt-16 pb-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <h1
            className="rise display-1"
            style={{ '--d': '0ms' } as CSSProperties}
          >
            Foto isi kulkas.{' '}
            <span className="text-flame-600">Lima menu siap dimasak.</span>
          </h1>

          <p
            className="rise lede measure mt-6"
            style={{ '--d': '90ms' } as CSSProperties}
          >
            Model vision membaca bahan yang benar-benar terlihat, memperkirakan takarannya, lalu
            menyusun lima resep lengkap dengan bahan tambahan, langkah memasak, dan catatan koki.
          </p>

          <div
            className="rise mt-9 flex flex-wrap items-center gap-3"
            style={{ '--d': '180ms' } as CSSProperties}
          >
            <Magnetic>
              <a
                href="/dashboard"
                className="btn-arrow group inline-flex items-center gap-2 rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-on-accent shadow-glow transition-colors hover:bg-flame-600"
              >
                Mulai analisis
                <ArrowRight className="size-4" />
              </a>
            </Magnetic>
            <a
              href="#cara-kerja"
              className="group inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-fg-soft transition-colors hover:border-line-2 hover:bg-surface-2"
            >
              Lihat cara kerja
            </a>
          </div>

          <ul
            className="rise mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-fg-muted"
            style={{ '--d': '270ms' } as CSSProperties}
          >
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <item.icon className="size-4 text-flame-300" strokeWidth={1.7} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[24rem] lg:mr-0">
          <div aria-hidden className="absolute inset-x-6 top-10 bottom-16 -z-10 rounded-[40%] bg-flame-200/25 blur-3xl" />

          <img
            src={fridgeImage}
            alt="Kulkas terbuka berisi bahan segar siap dimasak"
            width={820}
            height={1230}
            className="w-full select-none drop-shadow-[0_28px_50px_rgba(15,23,42,0.22)]"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
