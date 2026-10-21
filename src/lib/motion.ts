import { useCallback, useEffect, useState, type MouseEvent } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const FINE_POINTER_QUERY = '(hover: hover), (pointer: fine)'

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

interface MagneticResult<T extends HTMLElement> {
  onMouseMove: (event: MouseEvent<T>) => void
  onMouseLeave: () => void
  magneticStyle: {
    transform?: string
    transition?: string
  }
}

/** Tarik elemen sedikit ke arah kursor. Hanya aktif di perangkat dengan pointer presisi. */
export function useMagnetic<T extends HTMLElement>(strength = 5): MagneticResult<T> {
  const reduced = usePrefersReducedMotion()
  const [finePointer, setFinePointer] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(FINE_POINTER_QUERY).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER_QUERY)
    const onChange = (event: MediaQueryListEvent) => setFinePointer(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const enabled = finePointer && !reduced
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)

  const onMouseMove = useCallback(
    (event: MouseEvent<T>) => {
      if (!enabled) return
      const target = event.currentTarget as T
      const rect = target.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const magnitude = Math.hypot(dx, dy) || 1
      const scale = Math.min(1, strength / magnitude)
      setOffset({ x: dx * scale, y: dy * scale })
    },
    [enabled, strength],
  )

  const onMouseLeave = useCallback(() => {
    setOffset(null)
  }, [])

  const magneticStyle = !enabled
    ? {}
    : offset
      ? {
        transform: `translate(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px)`,
        transition: 'transform 90ms cubic-bezier(0.22, 1, 0.36, 1)',
      }
      : {
        transform: 'translate(0px, 0px)',
        transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      }

  return { onMouseMove, onMouseLeave, magneticStyle }
}
