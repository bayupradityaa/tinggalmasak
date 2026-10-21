import { useEffect, useState } from 'react'
import { ArrowRight, Bookmark, Camera, History, Lock, ShieldCheck, Sparkles } from 'lucide-react'
import AuthModal from '../components/AuthModal'
import Faq from '../components/Faq'
import FeatureGrid from '../components/FeatureGrid'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import IconTile from '../components/Icon'
import Magnetic from '../components/Magnetic'
import Nav from '../components/Nav'
import { refreshScrollTriggers, useScrollMotion } from '../lib/scroll'
import ctaImage from '../assets/cta-citrus.webp'

const STATS = [
  { value: '1 foto', label: 'cukup untuk satu analisis' },
  { value: '15–30 dtk', label: 'waktu proses rata-rata' },
  { value: '5 menu', label: 'disusun per analisis' },
  { value: '24 jam', label: 'tersedia kapan saja' },
]

const PRIVACY = [
  {
    icon: Lock,
    title: 'Foto tidak dibagikan',
    body: 'Foto hanya diproses untuk analisis milikmu. Tidak ada pengguna lain yang dapat melihatnya.',
  },
  {
    icon: ShieldCheck,
    title: 'Penyimpanan privat',
    body: 'Foto yang kamu simpan masuk ke penyimpanan privat dengan akses terbatas pada akun pemiliknya.',
  },
  {
    icon: Sparkles,
    title: 'Kendali penuh',
    body: 'Hapus riwayat kapan saja. Foto yang tersimpan ikut terhapus dari penyimpanan.',
  },
]

const DASHBOARD_FEATURES = [
  {
    icon: Camera,
    title: 'Scan',
    body: 'Unggah satu foto isi kulkas, dapatkan lima menu lengkap dengan langkah memasak.',
  },
  {
    icon: Bookmark,
    title: 'Bahan bisa dikoreksi',
    body: 'Perbaiki bahan yang salah terbaca, lalu susun ulang menu tanpa foto ulang.',
  },
  {
    icon: History,
    title: 'Riwayat',
    body: 'Seluruh hasil analisis tersimpan rapi dan dapat dihapus kapan saja.',
  },
]

export default function Landing() {
  const [authOpen, setAuthOpen] = useState(false)

  useScrollMotion()

  useEffect(() => {
    refreshScrollTriggers()
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-fg-soft">
      <div
        aria-hidden
        className="grain pointer-events-none fixed inset-0 z-40 opacity-[0.04] mix-blend-multiply"
      />

      <Nav onOpenAuth={() => setAuthOpen(true)} />

      <main>
        <Hero />

        <section className="border-y border-line bg-surface-2">
          <dl
            className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-5 sm:px-8 lg:grid-cols-4"
            data-reveal-group
          >
            {STATS.map((stat) => (
              <div key={stat.label} data-reveal-item className="px-2 py-7 text-center">
                <dt className="font-display text-[1.6rem] font-medium tracking-tight text-fg tabular-nums sm:text-[1.85rem]">
                  {stat.value}
                </dt>
                <dd className="mt-1.5 text-xs text-fg-faint">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <HowItWorks />

        <FeatureGrid />

        <section id="aplikasi" className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div data-reveal>
              <p className="eyebrow">Aplikasi</p>
              <h2 className="display-2 mt-3">Satu dashboard untuk seluruh alur memasak.</h2>
              <p className="lede measure mt-4">
                Analisis foto, koreksi bahan, dan buka riwayat kapan saja. Semua terikat ke
                akun sehingga dapat diakses dari perangkat mana pun.
              </p>
              <Magnetic className="mt-8 inline-block">
                <a
                  href="/dashboard"
                  className="btn-arrow group inline-flex items-center gap-2 rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-on-accent shadow-glow transition-colors hover:bg-flame-600"
                >
                  Buka dashboard
                  <ArrowRight className="size-4" />
                </a>
              </Magnetic>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1" data-reveal-group>
              {DASHBOARD_FEATURES.map((item) => (
                <li
                  key={item.title}
                  data-reveal-item
                  className="lift rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <IconTile icon={item.icon} />
                    <h3 className="heading-3">{item.title}</h3>
                  </div>
                  <p className="copy mt-2">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="privasi" className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl" data-reveal>
              <p className="eyebrow">Privasi</p>
              <h2 className="display-2 mt-3">Isi kulkasmu tetap milikmu.</h2>
              <p className="lede measure mt-4">
                Kami tidak menjual data, tidak menayangkan iklan bertarget, dan tidak memakai fotomu
                untuk melatih model.
              </p>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
              {PRIVACY.map((item) => (
                <li
                  key={item.title}
                  data-reveal-item
                  className="lift group rounded-2xl border border-line bg-surface p-6"
                >
                  <IconTile icon={item.icon} />
                  <h3 className="heading-3 mt-4">{item.title}</h3>
                  <p className="copy mt-2">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Faq />

        <section className="border-t border-line py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div data-reveal>
              <h2 className="display-2">Isi kulkasmu sudah cukup untuk makan malam.</h2>
              <p className="lede measure mt-4">
                Buat akun gratis dan mulai analisis pertama. Tanpa kartu kredit, tanpa proses
                pendaftaran yang berbelit.
              </p>
              <Magnetic className="mt-8 inline-block">
                <a
                  href="/dashboard"
                  className="btn-arrow group inline-flex items-center gap-2 rounded-full bg-flame-500 px-6 py-3 text-sm font-semibold text-on-accent shadow-glow transition-colors hover:bg-flame-450"
                >
                  Buat akun gratis
                  <ArrowRight className="size-4" />
                </a>
              </Magnetic>
            </div>

            <div className="relative" data-reveal>
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-flame-500/20 blur-3xl"
              />
              <div className="overflow-hidden rounded-[2rem] border border-line bg-surface-2 shadow-card">
                <img
                  src={ctaImage}
                  alt="Salad segar dengan jus jeruk"
                  width={1000}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                  data-parallax
                  className="aspect-[4/5] w-full scale-105 object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
