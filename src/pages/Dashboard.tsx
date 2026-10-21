import { useCallback, useEffect, useState } from 'react'
import {
  ArrowRight,
  Camera,
  History,
  Loader2,
  LogIn,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useAuth } from '../auth/auth-context'
import AuthBar from '../components/AuthBar'
import AuthModal from '../components/AuthModal'
import Brand from '../components/Brand'
import HistoryPanel from '../components/HistoryPanel'
import Scanner from '../components/Scanner'
import { listAnalyses } from '../lib/db'
import type { Analysis } from '../types/db'

type Tab = 'scan' | 'riwayat'

const TABS: { id: Tab; label: string; icon: typeof Camera }[] = [
  { id: 'scan', label: 'Scan', icon: Camera },
  { id: 'riwayat', label: 'Riwayat', icon: History },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days <= 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  return formatDate(iso)
}

function StatCard({
  label,
  value,
  hint,
  loading,
}: {
  label: string
  value: string
  hint: string
  loading: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-3.5 sm:p-5">
      <p className="text-[10px] font-medium tracking-[0.08em] text-fg-muted uppercase sm:text-xs">
        {label}
      </p>
      <p className="mt-1.5 font-display text-lg leading-tight font-medium tracking-[-0.02em] text-fg sm:mt-2 sm:text-[1.75rem]">
        {loading ? <span className="text-fg-faint">—</span> : value}
      </p>
      <p className="mt-2 hidden text-xs text-fg-faint sm:block">{hint}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, loading, configured } = useAuth()
  const [tab, setTab] = useState<Tab>('scan')
  const [authOpen, setAuthOpen] = useState(false)
  const [history, setHistory] = useState<Analysis[] | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Dashboard · Lethimcook.ai'
  }, [])

  const loadHistory = useCallback(async () => {
    if (!user) return
    try {
      setHistory(await listAnalyses())
      setHistoryError(null)
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Gagal memuat riwayat.')
      setHistory([])
    }
  }, [user])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- sinkronisasi dengan Supabase (sumber data eksternal)
    void loadHistory()
  }, [loadHistory])

  const name = profile?.display_name || user?.email || ''
  const totalMenus = history?.reduce((sum, row) => sum + row.recipes.length, 0) ?? 0
  const lastScan = history?.[0]?.created_at

  function openHistory(id: string) {
    setFocusId(id)
    setTab('riwayat')
  }

  return (
    <div className="min-h-screen bg-canvas text-fg-soft">
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" aria-label="Lethimcook.ai — beranda">
            <Brand />
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <AuthBar onOpenAuth={() => setAuthOpen(true)} />
            {/* Di layar kecil brand sudah menjadi tautan beranda. */}
            <a
              href="/"
              className="hidden rounded-full border border-line px-4 py-2 text-sm text-fg-soft transition-colors hover:bg-surface-2 sm:inline-block"
            >
              Beranda
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-20 text-sm text-fg-faint">
            <Loader2 className="size-4 animate-spin" /> Memuat akun...
          </p>
        ) : !user ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-8 text-center shadow-card sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-flame-100 text-flame-300">
              <LogIn className="size-5" strokeWidth={1.7} />
            </span>
            <h1 className="mt-5 display-2">Masuk untuk membuka dashboard.</h1>
            <p className="copy mx-auto mt-3 max-w-sm">
              Analisis foto, menu tersimpan, dan riwayat terikat ke akunmu. Masuk atau daftar untuk
              melanjutkan.
            </p>
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              disabled={!configured}
              className="btn-arrow group mt-6 inline-flex items-center gap-2 rounded-xl bg-flame-500 px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-flame-450 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-fg-faint"
            >
              Masuk atau daftar
              <Sparkles className="size-4" />
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            {/* Navigasi: rail vertikal di desktop, segmented scroll di mobile. */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <nav
                aria-label="Menu dashboard"
                className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0"
              >
                {TABS.map((t) => {
                  const active = tab === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      aria-pressed={active}
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors lg:w-full lg:gap-3 lg:rounded-lg ${
                        active
                          ? 'bg-flame-100 font-semibold text-flame-200 ring-1 ring-inset ring-flame-500/25'
                          : 'text-fg-muted hover:bg-surface-2 hover:text-fg-soft'
                      }`}
                    >
                      <t.icon
                        className={`size-4 ${active ? 'text-flame-300' : 'text-fg-faint'}`}
                        strokeWidth={1.8}
                      />
                      {t.label}
                    </button>
                  )
                })}
              </nav>
            </aside>

            <div className="mt-6 min-w-0 lg:mt-0">
              <header className="max-w-2xl">
                <p className="eyebrow">Dashboard</p>
                <h1 className="mt-2 font-display text-[1.7rem] leading-tight font-medium tracking-[-0.015em] text-fg sm:text-[2rem]">
                  Halo, {name}.
                </h1>
                <p className="copy-sm measure mt-2.5">
                  Mulai analisis baru, buka menu yang sudah tersimpan, atau tinjau riwayat
                  pemindaian sebelumnya.
                </p>
              </header>

              <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                <StatCard
                  label="Total scan"
                  value={String(history?.length ?? 0)}
                  hint="Tersimpan di riwayat"
                  loading={history === null}
                />
                <StatCard
                  label="Menu tersusun"
                  value={String(totalMenus)}
                  hint="Resep dari seluruh scan"
                  loading={history === null}
                />
                <StatCard
                  label="Scan terakhir"
                  value={lastScan ? formatRelative(lastScan) : 'Belum ada'}
                  hint={lastScan ? formatDate(lastScan) : 'Mulai dari foto kulkas'}
                  loading={history === null}
                />
              </div>

              <div className="mt-8">
                <div className={tab === 'scan' ? '' : 'hidden'}>
                  {/* Tetap ter-mount: analisis tidak berhenti saat pindah tab. */}
                  <Scanner
                    onRequireAuth={() => setAuthOpen(true)}
                    onSaved={() => void loadHistory()}
                    history={history}
                    onOpenHistory={openHistory}
                  />
                </div>
                <div className={tab === 'riwayat' ? '' : 'hidden'}>
                  <HistoryPanel
                    key={focusId ?? 'riwayat'}
                    rows={history}
                    error={historyError}
                    focusId={focusId}
                    onChanged={() => void loadHistory()}
                  />
                </div>
              </div>

              {tab === 'scan' && (
                <section className="mt-10">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-sans text-[1.0625rem] font-semibold tracking-[-0.01em] text-fg">
                      Aktivitas terakhir
                    </h2>
                    {history && history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setTab('riwayat')}
                        className="inline-flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg-soft"
                      >
                        Lihat semua <ArrowRight className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {history === null ? (
                    <p className="mt-3 flex items-center gap-2 text-sm text-fg-faint">
                      <Loader2 className="size-4 animate-spin" /> Memuat aktivitas...
                    </p>
                  ) : history.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-dashed border-line-2 bg-surface p-6">
                      <p className="text-sm font-medium text-fg-soft">Belum ada aktivitas.</p>
                      <p className="copy-sm mt-1">
                        Scan pertamamu akan muncul di sini: foto bahan, bahan yang dikoreksi, dan
                        lima menu yang bisa langsung disimpan ke riwayat.
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
                      {history.slice(0, 3).map((row) => (
                        <li key={row.id}>
                          <button
                            type="button"
                            onClick={() => openHistory(row.id)}
                            className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/60 sm:px-5"
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-flame-100 text-flame-300">
                              <UtensilsCrossed className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-fg-soft">
                                {row.detected_ingredients.map((i) => i.name).join(', ') ||
                                  'Bahan tidak terbaca'}
                              </span>
                              <span className="mt-0.5 block text-xs text-fg-faint">
                                {formatRelative(row.created_at)} · {row.recipes.length} menu
                              </span>
                            </span>
                            <ArrowRight className="size-4 shrink-0 text-fg-faint" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
