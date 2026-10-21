import type { LucideIcon } from 'lucide-react'

const SIZES = {
  sm: { tile: 'size-9 rounded-xl', icon: 'size-4.5' },
  md: { tile: 'size-11 rounded-2xl', icon: 'size-5' },
  lg: { tile: 'size-12 rounded-2xl', icon: 'size-6' },
} as const

type IconSize = keyof typeof SIZES

/** Ikon di dalam kotak bergradasi lembut — seragam untuk semua section. */
export default function IconTile({
  icon: Icon,
  size = 'md',
  className = '',
}: {
  icon: LucideIcon
  size?: IconSize
  className?: string
}) {
  const s = SIZES[size]

  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center bg-gradient-to-br from-flame-100 to-surface text-flame-300 ring-1 ring-flame-200/30 shadow-sm transition-transform duration-300 group-hover:scale-105 ${s.tile} ${className}`}
    >
      <Icon className={s.icon} strokeWidth={1.7} />
    </span>
  )
}
