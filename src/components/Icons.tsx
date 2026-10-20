import type { ReactNode } from 'react'

export interface IconProps {
  className?: string
}

function Svg({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function ArrowUpRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  )
}

export function ArrowDown({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </Svg>
  )
}

export function ArrowRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  )
}

export function Check({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m20 6-11 11-5-5" />
    </Svg>
  )
}

export function Close({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Svg>
  )
}

export function Menu({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </Svg>
  )
}

export function Camera({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1 1 0 0 0 .84-.46l.72-1.08A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .84.46l.72 1.08a1 1 0 0 0 .84.46h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.25" />
    </Svg>
  )
}

export function Upload({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </Svg>
  )
}

export function ImageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 4.8-4.8a2 2 0 0 1 2.83 0L20 20" />
    </Svg>
  )
}

export function Eye({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function EyeOff({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 3 21 21" />
      <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17.7 17.7 0 0 1-3.2 3.9" />
      <path d="M6.3 6.8A17.6 17.6 0 0 0 2.5 12S6 18 12 18a10.6 10.6 0 0 0 4.3-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Svg>
  )
}

export function Clock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  )
}

export function ChefHat({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7 13.5a4 4 0 0 1-1.2-7.8 4.2 4.2 0 0 1 8-1.2 4.2 4.2 0 0 1 4.2 4.2 4 4 0 0 1-1 2.7" />
      <path d="M7 13.5V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-5.5" />
      <path d="M7 16.5h10" />
    </Svg>
  )
}

export function Users({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.25 3.25 0 0 1 0 6.3" />
      <path d="M17.2 14.5a5.5 5.5 0 0 1 3.3 5" />
    </Svg>
  )
}

export function Sparkle({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3.5 13.7 8.3 18.5 10 13.7 11.7 12 16.5 10.3 11.7 5.5 10l4.8-1.7z" />
      <path d="M18.5 16.5v3" />
      <path d="M17 18h3" />
    </Svg>
  )
}

export function Leaf({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.5 19.5C4.5 11 10 5.5 20 4c0 10-5.5 15.5-14 15.5" />
      <path d="M4.5 19.5c2-5 5.5-8.5 10-10.5" />
    </Svg>
  )
}

export function Refrigerator({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5.5" y="2.5" width="13" height="19" rx="2.5" />
      <path d="M5.5 10h13" />
      <path d="M9 6v2" />
      <path d="M9 13v3" />
    </Svg>
  )
}

export function Bowl({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 11h18a9 9 0 0 1-18 0Z" />
      <path d="M8 20h8" />
      <path d="M9 7.5c0-1.5 1.2-2.5 3-2.5s3 1 3 2.5" />
    </Svg>
  )
}

export function Swap({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 7h13" />
      <path d="m13.5 3.5 3.5 3.5-3.5 3.5" />
      <path d="M20 17H7" />
      <path d="M10.5 13.5 7 17l3.5 3.5" />
    </Svg>
  )
}

export function Timer({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 10v3.5l2.5 1.5" />
      <path d="M9 2.5h6" />
      <path d="M12 2.5V6" />
    </Svg>
  )
}

export function ChevronRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  )
}

export function Lock({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M12 14.5v2" />
    </Svg>
  )
}

export function AlertCircle({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5" />
      <path d="M12 16.2h.01" />
    </Svg>
  )
}

export function FileImage({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <circle cx="9" cy="13" r="1" />
      <path d="m7.5 18 3-3 2 2 2-2 2 3" />
    </Svg>
  )
}

export function Plus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  )
}

export function Minus({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 12h14" />
    </Svg>
  )
}

export function LayoutGrid({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </Svg>
  )
}

export function Info({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.8h.01" />
    </Svg>
  )
}

export function CheckCircle({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </Svg>
  )
}
