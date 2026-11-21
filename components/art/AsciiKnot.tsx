'use client'

import { useEffect, useRef } from 'react'

// Luminance ramp, dark → bright.
const RAMP = ' .,-~:;=!*#$@'
const FPS = 30
const CHAR_ASPECT_FALLBACK = 0.6 // mono glyph width / line height

// (p, q) torus knot swept by a circular tube.
const KNOT_P = 2
const KNOT_Q = 3
const SEG_U = 520 // samples along the knot
const SEG_V = 36 // samples around the tube
const TUBE_R = 0.42

type Vec3 = [number, number, number]

interface Geometry {
  pos: Float32Array // xyz triplets
  nrm: Float32Array // unit normals
  count: number
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

function knotPoint(t: number): Vec3 {
  const r = 2 + Math.cos(KNOT_Q * t)
  return [r * Math.cos(KNOT_P * t), r * Math.sin(KNOT_P * t), -Math.sin(KNOT_Q * t)]
}

// Built once; per frame we only rotate + shade.
function buildGeometry(): Geometry {
  const count = SEG_U * SEG_V
  const pos = new Float32Array(count * 3)
  const nrm = new Float32Array(count * 3)
  const eps = 1e-3
  let k = 0
  for (let i = 0; i < SEG_U; i++) {
    const t = (i / SEG_U) * Math.PI * 2
    const c = knotPoint(t)
    const tangent = norm(sub(knotPoint(t + eps), knotPoint(t - eps)))
    const n = norm(cross(tangent, [0, 0, 1]))
    const b = cross(tangent, n)
    for (let j = 0; j < SEG_V; j++) {
      const a = (j / SEG_V) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      const dx = n[0] * ca + b[0] * sa
      const dy = n[1] * ca + b[1] * sa
      const dz = n[2] * ca + b[2] * sa
      pos[k] = c[0] + TUBE_R * dx
      pos[k + 1] = c[1] + TUBE_R * dy
      pos[k + 2] = c[2] + TUBE_R * dz
      nrm[k] = dx
      nrm[k + 1] = dy
      nrm[k + 2] = dz
      k += 3
    }
  }
  return { pos, nrm, count }
}

interface Frame {
  cols: number
  rows: number
  charAspect: number
  rotX: number
  rotY: number
  rotZ: number
}

function renderFrame(geo: Geometry, f: Frame, zbuf: Float32Array, out: Uint8Array): string {
  const { cols, rows, charAspect } = f
  zbuf.fill(0)
  out.fill(32) // space

  const cx = Math.cos(f.rotX), sx = Math.sin(f.rotX)
  const cy = Math.cos(f.rotY), sy = Math.sin(f.rotY)
  const cz = Math.cos(f.rotZ), sz = Math.sin(f.rotZ)

  // Fit the knot (radius ≈ 3.4) into the smaller screen dimension.
  const scale = Math.min(rows, cols * charAspect) * 0.13
  const camDist = 14
  const halfC = cols / 2
  const halfR = rows / 2
  // Light from upper-left-front.
  const lx = -0.45, ly = 0.6, lz = -0.66
  const rampMax = RAMP.length - 1

  const { pos, nrm, count } = geo
  for (let i = 0, k = 0; i < count; i++, k += 3) {
    // Rotate position: Z, then X, then Y.
    let x = pos[k], y = pos[k + 1], z = pos[k + 2]
    let tx = x * cz - y * sz
    let ty = x * sz + y * cz
    x = tx; y = ty
    ty = y * cx - z * sx
    let tz = y * sx + z * cx
    y = ty; z = tz
    tx = x * cy + z * sy
    tz = -x * sy + z * cy
    x = tx; z = tz

    const ooz = 1 / (z + camDist)
    const col = (halfC + (x * scale * camDist * ooz) / charAspect) | 0
    const row = (halfR - y * scale * camDist * ooz) | 0
    if (col < 0 || col >= cols || row < 0 || row >= rows) continue
    const idx = row * cols + col
    if (ooz <= zbuf[idx]) continue

    // Rotate normal identically.
    let nx = nrm[k], ny = nrm[k + 1], nz = nrm[k + 2]
    tx = nx * cz - ny * sz
    ty = nx * sz + ny * cz
    nx = tx; ny = ty
    ty = ny * cx - nz * sx
    tz = ny * sx + nz * cx
    ny = ty; nz = tz
    tx = nx * cy + nz * sy
    nz = -nx * sy + nz * cy
    nx = tx

    const lum = nx * lx + ny * ly + nz * lz
    zbuf[idx] = ooz
    // Keep back-lit surfaces faintly visible so the silhouette reads.
    const level = Math.max(1, Math.round(((lum + 1) / 2) * rampMax))
    out[idx] = RAMP.charCodeAt(level)
  }

  let s = ''
  for (let r = 0; r < rows; r++) {
    s += String.fromCharCode.apply(null, Array.from(out.subarray(r * cols, (r + 1) * cols)))
    if (r < rows - 1) s += '\n'
  }
  return s
}

function measureCharAspect(el: HTMLElement): number {
  const style = getComputedStyle(el)
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return CHAR_ASPECT_FALLBACK
  ctx.font = `${style.fontSize} ${style.fontFamily}`
  const w = ctx.measureText('M'.repeat(20)).width / 20
  const lh = parseFloat(style.lineHeight) || parseFloat(style.fontSize)
  return w > 0 && lh > 0 ? w / lh : CHAR_ASPECT_FALLBACK
}

export default function AsciiKnot({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const pre = preRef.current
    if (!wrap || !pre) return

    const geo = buildGeometry()
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
      t += dt
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
  }, [])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} aria-hidden="true">
      <pre
        ref={preRef}
        className="absolute inset-0 m-0 select-none whitespace-pre text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px]"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
      />
    </div>
  )
}
