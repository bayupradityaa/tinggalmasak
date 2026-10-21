/**
 * Scroll motion: Lenis (smooth scroll) + GSAP ScrollTrigger (reveal & parallax).
 *
 * Semua animasi dimatikan kalau pengguna minta `prefers-reduced-motion`.
 * Elemen yang dianimasikan ditandai lewat atribut data, bukan class, biar
 * styling tetap murni di CSS.
 *
 * GSAP + Lenis dimuat dinamis supaya bundle awal tetap ringan.
 */
import { useEffect } from 'react'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

let scrollTrigger: typeof ScrollTriggerType | null = null

/** Paksa hitung ulang posisi trigger (mis. setelah pindah tab atau gambar dimuat). */
export function refreshScrollTriggers(): void {
  scrollTrigger?.refresh()
}

/** Scroll halus ke elemen target, dipakai untuk link anchor internal. */
export function scrollToTarget(target: string): void {
  const el = document.querySelector(target)
  if (!el) return
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  if (lenis) {
    lenis.scrollTo(el, { offset: -80, duration: 1.1 })
    return
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function useScrollMotion(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    void (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)
      scrollTrigger = ScrollTrigger

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      })

      ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
      lenis.on('scroll', ScrollTrigger.update)

      const raf = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)

      // Lenis mengambil alih scrolling -> matikan scroll-behavior native biar tidak dobel.
      document.documentElement.style.scrollBehavior = 'auto'

      const context = gsap.context(() => {
        // Elemen tunggal: muncul naik saat masuk viewport.
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 32,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })

        // Grup: anak-anak muncul berurutan.
        gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
          const items = group.querySelectorAll('[data-reveal-item]')
          if (!items.length) return
          gsap.from(items, {
            y: 26,
            opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: 'top 86%', once: true },
          })
        })

        // Parallax halus untuk gambar besar (bukan hero).
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })

      // Anchor link ikut Lenis (bukan scroll-behavior native).
      const onClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null
        const link = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
        if (!link) return
        const hash = link.getAttribute('href')
        if (!hash || hash === '#' || !document.querySelector(hash)) return
        event.preventDefault()
        scrollToTarget(hash)
        history.replaceState(null, '', hash)
      }

      // Gambar yang telat dimuat mengubah tinggi halaman -> trigger perlu dihitung ulang.
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      document.addEventListener('click', onClick)

      cleanup = () => {
        document.removeEventListener('click', onClick)
        window.removeEventListener('load', onLoad)
        context.revert()
        gsap.ticker.remove(raf)
        lenis.destroy()
        delete (window as unknown as { __lenis?: Lenis }).__lenis
        document.documentElement.style.scrollBehavior = ''
        scrollTrigger = null
      }
    })()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])
}
