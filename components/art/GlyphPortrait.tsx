'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { AsciiGrid } from '@/lib/ascii/grid'
import { hash1 } from '@/lib/ascii/noise'

// Sparse → dense; dense glyphs read as "ink", so they map to whatever contrasts with the page.
const RAMP = '.:-=+*#%@'
const CHAR_ASPECT = 0.6 // glyph width / line height (leading == font size)
const BG_THRESHOLD = 0.14 // RGB distance under which a pixel is the flat avatar background
const FPS = 60
const REPEL_PX = 90
const SPRING = 38
const DAMPING = 7

interface Glyph {
  hx: number // home cell
  hy: number
  x: number
  y: number
  vx: number
  vy: number
  lum: number // 0–1 luminance of the source pixel
  rgb: [number, number, number]
}

interface Props {
  src: string
  alt: string
  cols?: number
  className?: string
}

/** Sample the avatar into glyphs: luminance → ramp, pixel colour → glyph colour, flat background dropped. */
async function sample(src: string, cols: number): Promise<{ glyphs: Glyph[]; rows: number }> {
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

  const corners = [0, cols - 1, (rows - 1) * cols, rows * cols - 1]
  const bg = [0, 1, 2].map(ch => corners.reduce((s, i) => s + data[i * 4 + ch], 0) / 4)
  const glyphs: Glyph[] = []
  let min = 1
  let max = 0
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4
      const rgb: [number, number, number] = [data[i], data[i + 1], data[i + 2]]
      if (Math.hypot(rgb[0] - bg[0], rgb[1] - bg[1], rgb[2] - bg[2]) / 255 < BG_THRESHOLD) continue
      const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
      min = Math.min(min, lum)
      max = Math.max(max, lum)
      glyphs.push({ hx: c, hy: r, x: c, y: r, vx: 0, vy: 0, lum, rgb })
    }
  const range = max - min || 1
  glyphs.forEach(g => (g.lum = (g.lum - min) / range))
  return { glyphs, rows }
}

/** Keep glyph colours legible on the page background. */
function toCss([r, g, b]: [number, number, number], dark: boolean): string {
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  // Quantise to 16 levels so neighbouring glyphs share spans.
  const q = (v: number) => Math.round(v / 17) * 17
  if (!dark && l > 0.62) {
    const k = 0.62 / l
    return `rgb(${q(r * k)},${q(g * k)},${q(b * k)})`
  }
  if (dark && l < 0.3) {
    const k = 0.3 - l
    return `rgb(${q(r + 255 * k)},${q(g + 255 * k)},${q(b + 255 * k)})`
  }
  return `rgb(${q(r)},${q(g)},${q(b)})`
}

export default function GlyphPortrait({ src, alt, cols = 96, className = '' }: Props) {
  const { resolvedTheme } = useTheme()
  const preRef = useRef<HTMLPreElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const pre = preRef.current
    if (!pre) return
    const dark = resolvedTheme === 'dark'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const grid = new AsciiGrid(pre)
    let glyphs: Glyph[] = []
    let colors: string[] = []
    let raf = 0
    let last = 0
    let pointer: { x: number; y: number } | null = null
    let cancelled = false

    const draw = () => {
      grid.clear()
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i]
        const c = Math.round(g.x)
        const r = Math.round(g.y)
        if (c < 0 || r < 0 || c >= grid.cols || r >= grid.rows) continue
        const k = r * grid.cols + c
        const lum = dark ? g.lum : 1 - g.lum
        grid.chars[k] = RAMP[Math.min(RAMP.length - 1, Math.round(lum * (RAMP.length - 1)))]
        grid.colors[k] = colors[i]
      }
      grid.compose()
    }

    /** Integrate springs + pointer repulsion; returns true while anything is still moving. */
    const step = (dt: number) => {
      let moving = false
      const { cw, ch } = grid
      for (const g of glyphs) {
        let ax = (g.hx - g.x) * SPRING - g.vx * DAMPING
        let ay = (g.hy - g.y) * SPRING - g.vy * DAMPING
        if (pointer) {
          const dx = (g.x - pointer.x) * cw
          const dy = (g.y - pointer.y) * ch
          const d = Math.hypot(dx, dy)
          if (d < REPEL_PX && d > 0.01) {
            const f = (1 - d / REPEL_PX) ** 2 * 2600
            ax += (dx / d) * f / cw
            ay += (dy / d) * f / ch
          }
        }
        g.vx += ax * dt
        g.vy += ay * dt
        g.x += g.vx * dt
        g.y += g.vy * dt
        if (Math.abs(g.x - g.hx) > 0.02 || Math.abs(g.y - g.hy) > 0.02 || Math.abs(g.vx) + Math.abs(g.vy) > 0.05) moving = true
      }
      return moving
    }

    const loop = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000)
      last = now
      const moving = step(dt)
      draw()
      raf = moving || pointer ? requestAnimationFrame(loop) : 0
    }
    // The loop sleeps once every glyph is home; input wakes it.
    const wake = () => {
      if (reduceMotion || raf) return
      last = performance.now() - 1000 / FPS
      raf = requestAnimationFrame(loop)
    }

    const toCell = (e: PointerEvent) => {
      const rect = pre.getBoundingClientRect()
      return { x: (e.clientX - rect.left) / grid.cw, y: (e.clientY - rect.top) / grid.ch }
    }
    const onMove = (e: PointerEvent) => {
      pointer = toCell(e)
      wake()
    }
    const onLeave = () => {
      pointer = null
      wake()
    }
    const scatter = () => {
      glyphs.forEach((g, i) => {
        const a = hash1(i * 7 + Math.floor(performance.now())) * Math.PI * 2
        const v = 30 + hash1(i * 13) * 70
        g.vx += Math.cos(a) * v
        g.vy += Math.sin(a) * v * CHAR_ASPECT
      })
      wake()
    }

    sample(src, cols)
      .then(({ glyphs: gs, rows }) => {
        if (cancelled) return
        glyphs = gs
        colors = gs.map(g => toCss(g.rgb, dark))
        grid.setSize(cols, rows)
        pre.style.width = `${cols * grid.cw}px`
        pre.style.height = `${rows * grid.ch}px`
        if (!reduceMotion) {
          // Boot: glyphs start scattered and fly home.
          glyphs.forEach((g, i) => {
            g.x = g.hx + (hash1(i * 3) - 0.5) * cols * 1.4
            g.y = g.hy + (hash1(i * 5 + 1) - 0.5) * rows * 1.4
          })
        }
        draw()
        wake()
      })
      .catch(err => {
        console.warn('[glyph-portrait] unavailable', err)
        if (!cancelled) setFailed(true)
      })

    pre.addEventListener('pointermove', onMove)
    pre.addEventListener('pointerleave', onLeave)
    pre.addEventListener('click', scatter)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      pre.removeEventListener('pointermove', onMove)
      pre.removeEventListener('pointerleave', onLeave)
      pre.removeEventListener('click', scatter)
    }
  }, [src, cols, resolvedTheme])

  if (failed) return null
  return (
    <pre
      ref={preRef}
      role="img"
      aria-label={alt}
      className={`ascii m-0 cursor-crosshair select-none whitespace-pre ${className}`}
      style={{ fontFamily: 'var(--font-mono)' }}
    />
  )
}
