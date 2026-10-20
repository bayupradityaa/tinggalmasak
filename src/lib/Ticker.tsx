import { useCallback, useEffect, useRef, useState } from 'react'

export type TickerDirection = 'up' | 'down'

type TickerValue = string | number

interface TickerLayers {
  current: TickerValue
  leaving: TickerValue | null
  dir: TickerDirection
}

function parseValue(value: TickerValue): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function directionFor(previous: TickerValue, next: TickerValue): TickerDirection {
  const prevNumber = parseValue(previous)
  const nextNumber = parseValue(next)
  if (prevNumber === null || nextNumber === null) return 'up'
  return nextNumber < prevNumber ? 'down' : 'up'
}

export interface TickerProps {
  value: TickerValue
  delay?: number
  className?: string
}

export function Ticker({ value, delay = 0, className }: TickerProps) {
  const [layers, setLayers] = useState<TickerLayers>({
    current: value,
    leaving: null,
    dir: 'up',
  })

  const currentRef = useRef(value)

  useEffect(() => {
    if (currentRef.current === value) return
    const previous = currentRef.current
    currentRef.current = value
    setLayers(() => ({
      current: value,
      leaving: previous,
      dir: directionFor(previous, value),
    }))
  }, [value])

  const clearLeaving = useCallback(() => {
    setLayers((current) => ({ ...current, leaving: null }))
  }, [])

  return (
    <span className={`ticker${className ? ` ${className}` : ''}`} data-ticker-dir={layers.dir}>
      {layers.leaving !== null && (
        <span
          aria-hidden="true"
          className="ticker-layer ticker-layer--out"
          key={`out-${layers.leaving}`}
          style={{ animationDelay: `${delay}ms` }}
          onAnimationEnd={clearLeaving}
        >
          {layers.leaving}
        </span>
      )}
      <span
        className="ticker-layer ticker-layer--in"
        key={`in-${value}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {layers.current}
      </span>
    </span>
  )
}
