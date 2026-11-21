'use client'

import { useEffect, useRef } from 'react'
import { buildGeometry, renderFrame, TREFOIL, type KnotShape } from '@/lib/ascii-knot'

const FPS = 30
const CHAR_ASPECT_FALLBACK = 0.6 // mono glyph width / line height

function measureCharAspect(el: HTMLElement): number {
  const style = getComputedStyle(el)
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return CHAR_ASPECT_FALLBACK
  ctx.font = `${style.fontSize} ${style.fontFamily}`
  const w = ctx.measureText('M'.repeat(20)).width / 20
  const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize)
  return w > 0 && lh > 0 ? w / lh : CHAR_ASPECT_FALLBACK
}

interface AsciiKnotProps {
  className?: string
  /** Knot winding numbers; defaults to the trefoil used in the hero. */
  shape?: KnotShape
  /** Rotation speed multiplier. */
  speed?: number
  /** Tailwind font-size/line-height classes for the glyph grid. */
  glyphClass?: string
}

export default function AsciiKnot({
  className = '',
  shape = TREFOIL,
  speed = 1,
  glyphClass = 'text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px]',
}: AsciiKnotProps) {
  const { p, q } = shape
  const wrapRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const pre = preRef.current
    if (!wrap || !pre) return

    const geo = buildGeometry({ p, q })
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cols = 0, rows = 0, charAspect = CHAR_ASPECT_FALLBACK
    let zbuf = new Float32Array(0)
    let out = new Uint8Array(0)

    let t = 0
    let tiltX = 0, tiltY = 0 // eased pointer tilt
    let targetX = 0, targetY = 0
    let raf = 0
    let last = 0
    let visible = true

    const draw = () => {
      if (cols === 0 || rows === 0) return
      pre.textContent = renderFrame(
        geo,
        { cols, rows, charAspect, rotX: 0.9 + t * 0.35 + tiltX, rotY: t * 0.5 + tiltY, rotZ: t * 0.2 },
        zbuf,
        out,
      )
    }

    const resize = () => {
      charAspect = measureCharAspect(pre)
      const style = getComputedStyle(pre)
      const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize)
      const cw = lh * charAspect
      cols = Math.max(10, Math.floor(wrap.clientWidth / cw))
      rows = Math.max(6, Math.floor(wrap.clientHeight / lh))
      zbuf = new Float32Array(cols * rows)
      out = new Uint8Array(cols * rows)
      draw()
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / FPS) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      t += dt * speed
      tiltX += (targetX - tiltX) * 0.06
      tiltY += (targetY - tiltY) * 0.06
      draw()
    }

    const start = () => {
      if (reduceMotion || raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onPointer = (e: PointerEvent) => {
      targetY = (e.clientX / window.innerWidth - 0.5) * 0.8
      targetX = (e.clientY / window.innerHeight - 0.5) * 0.6
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(wrap)

    document.addEventListener('visibilitychange', onVisibility)
    if (!reduceMotion) window.addEventListener('pointermove', onPointer, { passive: true })

    // Fonts load async (next/font swap) → re-measure once they are ready.
    document.fonts?.ready.then(resize).catch(() => {})
    resize()
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [p, q, speed])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <pre
        ref={preRef}
        className={`absolute inset-0 m-0 select-none whitespace-pre ${glyphClass}`}
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
      />
    </div>
  )
}
