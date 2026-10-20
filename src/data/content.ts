export interface FridgePin {
  id: string
  label: string
  detail: string
  /** Position on the fridge image, in percent of the image box. */
  x: number
  y: number
  /** Which side the pin label opens toward. */
  side: 'left' | 'right'
  recipes: string[]
}

/**
 * Pins are placed against the refrigerator photo. Coordinates are measured
 * on the source image so the labels track the shelves at any size.
 */
export const FRIDGE_PINS: FridgePin[] = [
  {
    id: 'telur',
    label: 'Telur Ayam',
    detail: '6 butir',
    x: 50,
    y: 35,
    side: 'right',
    recipes: ['Tumis tahu sayuran', 'Telur dadar sayur', 'Nasi goreng kampung'],
  },
  {
    id: 'ikan',
    label: 'Ikan & Daging Segar',
    detail: '1 keranjang',
    x: 28,
    y: 55,
    side: 'left',
    recipes: ['Pepes ikan kemangi', 'Tumis tahu sayuran', 'Sup ayam bening'],
  },
  {
    id: 'sayur',
    label: 'Sayur & Tomat Ceri',
    detail: '2 laci penuh',
    x: 76,
    y: 74,
    side: 'right',
    recipes: ['Tumis tahu sayuran', 'Capcay rumahan', 'Sup ayam bening'],
  },
  {
    id: 'brokoli',
    label: 'Brokoli & Wortel',
    detail: 'siap dipakai',
    x: 40,
    y: 87,
    side: 'left',
    recipes: ['Capcay rumahan', 'Tumis tahu sayuran', 'Telur dadar sayur'],
  },
]

export interface DetectedIngredient {
  id: string
  label: string
  defaultActive: boolean
}

export const DETECTED_INGREDIENTS: DetectedIngredient[] = [
  { id: 'tahu', label: 'Tahu', defaultActive: true },
  { id: 'tomat', label: 'Tomat ceri', defaultActive: true },
  { id: 'brokoli', label: 'Brokoli', defaultActive: true },
  { id: 'wortel', label: 'Wortel', defaultActive: true },
  { id: 'telur', label: 'Telur ayam', defaultActive: true },
  { id: 'bawang', label: 'Bawang putih', defaultActive: true },
  { id: 'cabai', label: 'Cabai merah', defaultActive: false },
  { id: 'daun-bawang', label: 'Daun bawang', defaultActive: false },
]

export interface RecipeAmount {
  name: string
  /** Amount for the 2-portion baseline. */
  base: number
  unit: string
  /** Rounded to whole units where sensible (eggs, tomatoes). */
  whole?: boolean
}

export const RECIPE = {
  title: 'Tumis tahu sayuran',
  meta: { time: '20 menit', difficulty: 'Mudah', servings: 2 },
  description:
    'Tahu goreng renyah dipadu sayuran yang sudah ada di kulkas, dibumbui bawang putih dan sedikit kecap. Cepat, hangat, dan tidak menyisakan bahan.',
  available: [
    { name: 'Tahu putih', base: 4, unit: 'potong', whole: true },
    { name: 'Tomat ceri', base: 8, unit: 'butir', whole: true },
    { name: 'Brokoli', base: 120, unit: 'g' },
    { name: 'Wortel', base: 1, unit: 'buah', whole: true },
    { name: 'Telur ayam', base: 1, unit: 'butir', whole: true },
  ] satisfies RecipeAmount[],
  extra: [
    { name: 'Bawang putih', base: 2, unit: 'siung', whole: true },
    { name: 'Kecap manis', base: 1, unit: 'sdm' },
    { name: 'Minyak goreng', base: 2, unit: 'sdm' },
    { name: 'Garam & merica', base: 0, unit: 'secukupnya' },
  ] satisfies RecipeAmount[],
  steps: [
    {
      title: 'Siapkan bahan',
      body: 'Potong tahu menjadi dadu, siangi brokoli dan wortel, lalu belah tomat ceri menjadi dua.',
    },
    {
      title: 'Tumis bumbu',
      body: 'Panaskan minyak, tumis bawang putih hingga harum, lalu masukkan wortel dan brokoli. Aduk sebentar.',
    },
    {
      title: 'Masak & sajikan',
      body: 'Masukkan tahu, tomat, telur, dan kecap. Aduk rata sampai matang, koreksi rasa, lalu sajikan hangat.',
    },
  ],
}

export interface Substitution {
  id: string
  missing: string
  alternative: string
  note: string
}

export const SUBSTITUTIONS: Substitution[] = [
  {
    id: 'saus-tiram',
    missing: 'Saus tiram',
    alternative: 'Kecap manis + sedikit garam',
    note: 'Rasa gurihnya lebih lembut, tapi tetap pas untuk tumisan sayur.',
  },
  {
    id: 'brokoli',
    missing: 'Brokoli',
    alternative: 'Kembang kol atau buncis',
    note: 'Tekstur renyahnya mirip, waktu masaknya juga hampir sama.',
  },
  {
    id: 'tahu',
    missing: 'Tahu',
    alternative: 'Tempe atau tahu pong',
    note: 'Tempe menyerap bumbu lebih cepat; goreng setengah matang dulu.',
  },
]

export interface TimeWindow {
  id: string
  label: string
  minutes: number
  ideas: string[]
  note: string
}

export const TIME_WINDOWS: TimeWindow[] = [
  {
    id: 'cepat',
    label: '≤ 15 menit',
    minutes: 15,
    ideas: ['Telur dadar sayur', 'Tumis brokoli bawang putih'],
    note: 'Satu wajan, dua langkah. Cocok untuk makan siang di sela kerja.',
  },
  {
    id: 'sedang',
    label: '20–30 menit',
    minutes: 30,
    ideas: ['Tumis tahu sayuran', 'Capcay rumahan'],
    note: 'Waktu yang cukup untuk menumis bumbu dan memasak sayur sampai matang.',
  },
  {
    id: 'santai',
    label: '45 menit+',
    minutes: 45,
    ideas: ['Sup ayam bening', 'Pepes ikan kemangi'],
    note: 'Untuk akhir pekan: kuah yang lebih dalam dan rasa yang lebih tenang.',
  },
]

export interface IngredientMatrixItem {
  id: string
  label: string
  dishes: number
}

export const MATRIX_INGREDIENTS: IngredientMatrixItem[] = [
  { id: 'tahu', label: 'Tahu', dishes: 7 },
  { id: 'tomat', label: 'Tomat', dishes: 6 },
  { id: 'brokoli', label: 'Brokoli', dishes: 5 },
  { id: 'wortel', label: 'Wortel', dishes: 6 },
  { id: 'telur', label: 'Telur', dishes: 8 },
  { id: 'bawang', label: 'Bawang putih', dishes: 9 },
]

export const NAV_LINKS = [
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#inspirasi-masakan', label: 'Inspirasi masakan' },
  { href: '#tentang', label: 'Tentang' },
]
