import { ChevronDown } from 'lucide-react'

const FAQ = [
  {
    q: 'Apakah perlu akun untuk memindai?',
    a: 'Ya. Analisis memerlukan akun agar hasil dan foto tidak tercampur antar pengguna. Pendaftaran gratis dan dapat dilakukan dengan email atau Google.',
  },
  {
    q: 'Apakah foto kulkas saya disimpan?',
    a: 'Secara bawaan, foto hanya diproses di browser selama analisis berlangsung. Jika kamu memilih “Simpan hasil”, foto diunggah ke penyimpanan privat yang hanya dapat diakses akunmu dan dapat dihapus dari panel riwayat.',
  },
  {
    q: 'Berapa lama prosesnya?',
    a: 'Umumnya 15–30 detik. Foto diperkecil di browser, dikirim ke server, lalu model vision membaca bahan dan menyusun resep.',
  },
  {
    q: 'Bagaimana jika bahan tidak terbaca jelas?',
    a: 'Setiap bahan diberi tingkat keyakinan sehingga kamu tahu mana yang perlu diperiksa. Foto dari atas dengan pencahayaan terang umumnya terbaca lebih baik.',
  },
  {
    q: 'Apakah resepnya sudah memenuhi kebutuhan gizi?',
    a: 'Belum tentu. Resep berfungsi sebagai ide dan panduan memasak. Untuk kebutuhan medis atau diet khusus, konsultasikan dengan dokter atau ahli gizi.',
  },
  {
    q: 'Bisa dipakai untuk usaha rumahan?',
    a: 'Saat ini layanan ditujukan untuk penggunaan pribadi. Untuk kebutuhan komersial, hubungi kami agar dapat dibahas lebih lanjut.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="border-t border-line py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2 className="display-2 mt-3">Pertanyaan yang sering diajukan.</h2>
          <p className="copy measure mt-4">
            Belum terjawab? Rincian penanganan data tersedia di bagian privasi di atas.
          </p>
        </div>

        <div
          className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface"
          data-reveal
        >
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-semibold tracking-[-0.005em] text-fg marker:hidden">
                {item.q}
                <ChevronDown className="size-4 shrink-0 text-fg-faint transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="copy mt-3 pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
