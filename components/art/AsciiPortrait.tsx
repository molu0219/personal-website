'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

// Sparse → dense. Dense glyphs read as "ink", so they map to whatever contrasts with the page.
const RAMP = ' .,:-=+*#%@'
const CHAR_ASPECT = 0.6 // mono glyph width / line height (leading == font size)
// RGB distance (0–1) under which a pixel counts as the flat background and renders blank.
const BG_THRESHOLD = 0.14

interface Props {
  src: string
  /** Glyphs per row; rows follow the image aspect. */
  cols?: number
  className?: string
}

interface Sample {
  /** 0–1 luminance, contrast-stretched over foreground pixels; -1 marks background. */
  lum: Float32Array
  rows: number
}

async function sampleLuminance(src: string, cols: number): Promise<Sample> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  await img.decode()

  const rows = Math.max(1, Math.round((cols * CHAR_ASPECT * img.naturalHeight) / img.naturalWidth))
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2d context unavailable')
  ctx.drawImage(img, 0, 0, cols, rows)
  const { data } = ctx.getImageData(0, 0, cols, rows) // throws if the host blocks CORS

  // Background = average of the four corners (avatars usually sit on a flat fill).
  const corners = [0, cols - 1, (rows - 1) * cols, rows * cols - 1]
  const bg = [0, 1, 2].map(ch => corners.reduce((sum, i) => sum + data[i * 4 + ch], 0) / 4)

  const lum = new Float32Array(cols * rows)
  let min = 1, max = 0
  for (let i = 0; i < lum.length; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]]
    const dist = Math.hypot(r - bg[0], g - bg[1], b - bg[2]) / 255
    if (dist < BG_THRESHOLD) {
      lum[i] = -1
      continue
    }
    const v = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    lum[i] = v
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min || 1
  return { lum: lum.map(v => (v < 0 ? -1 : (v - min) / range)), rows }
}

function toText(lum: Float32Array, cols: number, rows: number, dark: boolean): string {
  const top = RAMP.length - 1
  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    let line = ''
    for (let c = 0; c < cols; c++) {
      const v = lum[r * cols + c]
      if (v < 0) {
        line += ' '
        continue
      }
      // On a dark page bright pixels get dense glyphs; on a light page dark pixels do.
      // Floor at 1 so foreground never vanishes into blank background.
      line += RAMP[Math.max(1, Math.round((dark ? v : 1 - v) * top))]
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export default function AsciiPortrait({ src, cols = 56, className = '' }: Props) {
  const { resolvedTheme } = useTheme()
  const [sample, setSample] = useState<Sample | null>(null)

  useEffect(() => {
    let cancelled = false
    sampleLuminance(src, cols)
      .then(s => !cancelled && setSample(s))
      // Decorative: if the image host blocks CORS we just render nothing.
      .catch(err => console.warn('[ascii-portrait] unavailable', err))
    return () => {
      cancelled = true
    }
  }, [src, cols])

  if (!sample) return null
  return (
    <pre
      aria-hidden="true"
      className={`ascii-reveal m-0 select-none whitespace-pre ${className}`}
      style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
    >
      {toText(sample.lum, cols, sample.rows, resolvedTheme !== 'light')}
    </pre>
  )
}
