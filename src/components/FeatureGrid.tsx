import { Bookmark, Lightbulb, ShieldCheck, Sparkles, TrendingDown, User } from 'lucide-react'
import recipeImage from '../assets/recipe-plate.webp'
import boardImage from '../assets/ingredients-board.webp'
import IconTile from './Icon'

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Akun gratis, fitur terbuka',
    body: 'Satu akun memberi akses ke seluruh fitur: analisis foto, resep tersimpan, dan riwayat tanpa batas.',
  },
  {
    icon: TrendingDown,
    title: 'Belanja lebih hemat',
    body: 'Bahan yang tersedia dipakai lebih dulu. Yang perlu dibeli hanya bahan tambahan yang benar-benar kurang.',
  },
  {
    icon: Bookmark,
    title: 'Riwayat lengkap',
    body: 'Setiap hasil analisis tersimpan beserta menunya dan dapat dibuka kembali kapan saja.',
  },
  {
    icon: Lightbulb,
    title: 'Catatan sesuai selera',
    body: 'Tuliskan preferensi seperti “tanpa cabai” atau “harus cepat jadi”, dan resep menyesuaikan.',
  },
  {
    icon: User,
    title: 'Satu akun, semua perangkat',
    body: 'Masuk dengan email atau Google. Riwayat tetap tersedia di ponsel maupun laptop.',
  },
  {
    icon: ShieldCheck,
    title: 'Privat secara bawaan',
    body: 'Foto disimpan di penyimpanan privat yang hanya dapat diakses oleh akun pemiliknya.',
  },
]

const SHOWCASE = [
  {
    image: recipeImage,
    alt: 'Piring berisi hidangan yang baru dimasak',
    title: 'Menu mengikuti bahan yang ada',
    body: 'Resep disusun dari bahan yang terlihat pada foto, ditambah daftar bahan tambahan bila diperlukan. Tidak ada resep yang meleset karena bahannya berbeda.',
  },
  {
    image: boardImage,
    alt: 'Papan potongan bahan makanan dilihat dari atas',
    title: 'Bahan terbaca, bukan ditebak',
    body: 'Setiap bahan memiliki tingkat keyakinan. Bila nilainya rendah, kamu tahu bagian mana yang perlu diperiksa sebelum mulai memasak.',
  },
]

export default function FeatureGrid() {
  return (
    <section id="fitur" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow">Fitur</p>
            <h2 className="display-2 mt-3">Dirancang untuk dapur sehari-hari.</h2>
          </div>
          <p data-reveal className="lede measure lg:pb-2">
            Setiap fitur bekerja untuk satu tujuan: memakai bahan yang sudah ada dan mengurangi
            belanja yang tidak perlu.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal-group>
          {FEATURES.map((item) => (
            <li
              key={item.title}
              data-reveal-item
              className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-2"
            >
              <IconTile icon={item.icon} />
              <h3 className="heading-3 mt-5">{item.title}</h3>
              <p className="copy mt-2">{item.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-4 lg:grid-cols-2" data-reveal-group>
          {SHOWCASE.map((item) => (
            <article
              key={item.title}
              data-reveal-item
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  data-parallax
                  className="h-56 w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-110 sm:h-64"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-display text-[1.375rem] leading-snug font-medium tracking-[-0.01em] text-fg">
                  {item.title}
                </h3>
                <p className="copy mt-2">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
