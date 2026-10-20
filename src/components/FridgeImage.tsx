import { useEffect, useRef, useState } from 'react'
import fridgeSrc from '../assets/fridge.webp'

/**
 * Removes the studio-white exterior of the refrigerator photo.
 *
 * The source image already ships with a transparent surround, so a naive
 * "delete every white pixel" pass would also punch holes in the white door
 * panels and the lit shelves inside. Instead we flood-fill inward from the four
 * outer edges, which can only ever reach pixels connected to the outside of the
 * appliance. White pixels enclosed by the fridge body are never visited.
 */
function removeFridgeExteriorBackground(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return canvas

  ctx.drawImage(image, 0, 0)

  const { width, height } = canvas
  const frame = ctx.getImageData(0, 0, width, height)
  const data = frame.data
  const visited = new Uint8Array(width * height)

  const isStudioWhite = (index: number) => {
    const offset = index * 4
    const r = data[offset]
    const g = data[offset + 1]
    const b = data[offset + 2]
    const alpha = data[offset + 3]

    // Fully transparent pixels are already outside the appliance.
    if (alpha <= 8) return true

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lowSaturation = max - min <= 18
    return r > 235 && g > 235 && b > 232 && lowSaturation
  }

  const queue: number[] = []
  const enqueue = (index: number) => {
    if (visited[index]) return
    visited[index] = 1
    if (isStudioWhite(index)) queue.push(index)
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x)
    enqueue((height - 1) * width + x)
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width)
    enqueue(y * width + width - 1)
  }

  // Breadth-first fill. `cursor` avoids O(n) Array#shift on large images.
  let cursor = 0
  while (cursor < queue.length) {
    const index = queue[cursor]
    cursor += 1

    const offset = index * 4
    if (data[offset + 3] > 8) data[offset + 3] = 0

    const x = index % width
    const y = (index - x) / width

    if (x > 0) enqueue(index - 1)
    if (x < width - 1) enqueue(index + 1)
    if (y > 0) enqueue(index - width)
    if (y < height - 1) enqueue(index + width)
  }

  ctx.putImageData(frame, 0, 0)
  return canvas
}

type FridgeImageProps = {
  className?: string
  alt: string
}

/**
 * Renders the refrigerator as a freestanding cutout on the page background.
 * Falls back to the plain image if canvas pixel access is unavailable.
 */
export function FridgeImage({ className, alt }: FridgeImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    const image = new Image()
    image.decoding = 'async'
    image.src = fridgeSrc

    image
      .decode()
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return
        try {
          const processed = removeFridgeExteriorBackground(image)
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('2D context unavailable')
          canvas.width = processed.width
          canvas.height = processed.height
          ctx.clearRect(0, 0, processed.width, processed.height)
          ctx.drawImage(processed, 0, 0)
          setReady(true)
        } catch {
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="block h-auto w-full"
        style={{ visibility: ready ? 'visible' : 'hidden' }}
      />
      {!ready && (
        <img
          src={fridgeSrc}
          alt={failed ? alt : ''}
          aria-hidden={failed ? undefined : true}
          className="absolute inset-0 block h-auto w-full"
        />
      )}
    </div>
  )
}
