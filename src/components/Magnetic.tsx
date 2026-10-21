import type { ReactNode } from 'react'
import { useMagnetic } from '../lib/motion'

/** Bungkus elemen supaya tarik sedikit ke arah kursor (efek magnetik). */
export default function Magnetic({
  children,
  className,
  strength = 6,
}: {
  children: ReactNode
  className?: string
  strength?: number
}) {
  const magnetic = useMagnetic<HTMLSpanElement>(strength)

  return (
    <span
      className={className ?? 'inline-block'}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={magnetic.magneticStyle}
    >
      {children}
    </span>
  )
}
