import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { RecipePreview } from './components/RecipePreview'
import { Benefits } from './components/Benefits'
import { ClosingCTA } from './components/ClosingCTA'
import { Footer } from './components/Footer'
import { UploadDialog } from './components/UploadDialog'
import { LoginDialog } from './components/LoginDialog'
import { PreviewActionsContext } from './components/PreviewActions'

type DialogName = 'upload' | 'login' | null

export default function App() {
  const [dialog, setDialog] = useState<DialogName>(null)

  const openUpload = useCallback(() => setDialog('upload'), [])
  const openLogin = useCallback(() => setDialog('login'), [])
  const closeDialog = useCallback(() => setDialog(null), [])

  const actions = useMemo(() => ({ openUpload, openLogin }), [openUpload, openLogin])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !('IntersectionObserver' in window)) return

    document.documentElement.classList.add('reveal-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    const targets = Array.from(document.querySelectorAll('.reveal'))
    targets.forEach((target) => observer.observe(target))

    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('reveal-ready')
    }
  }, [])

  return (
    <PreviewActionsContext.Provider value={actions}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream"
      >
        Lewati ke konten utama
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <HowItWorks />
        <RecipePreview />
        <Benefits />
        <ClosingCTA />
      </main>

      <Footer />

      <UploadDialog open={dialog === 'upload'} onClose={closeDialog} />
      <LoginDialog open={dialog === 'login'} onClose={closeDialog} />
    </PreviewActionsContext.Provider>
  )
}
