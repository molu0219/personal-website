// ASCII (p, q) torus knot renderer shared by the hero animation and generated covers.
// Pure math, no DOM: safe on the server, in edge/worker runtimes and in the browser.

// Luminance ramp, dark → bright.
const RAMP = ' .,-~:;=!*#$@'

// (p, q) torus knot swept by a circular tube.
/** (p, q) winding numbers; coprime pairs give a single closed knot. (2,3) is the trefoil. */
export interface KnotShape {
  p: number
  q: number
}
export const TREFOIL: KnotShape = { p: 2, q: 3 }
/** Projects section shape (page header, cards, covers). */
export const PROJECT_KNOT: KnotShape = { p: 2, q: 5 }
const SEG_U = 520 // samples along the knot
const SEG_V = 36 // samples around the tube
const TUBE_R = 0.42

type Vec3 = [number, number, number]

export interface Geometry {
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

function knotPoint(t: number, { p, q }: KnotShape): Vec3 {
  const r = 2 + Math.cos(q * t)
  return [r * Math.cos(p * t), r * Math.sin(p * t), -Math.sin(q * t)]
}

// Built once; per frame we only rotate + shade.
export function buildGeometry(shape: KnotShape = TREFOIL): Geometry {
  // More windings need more samples along the curve to stay gap-free.
  const segU = Math.round(SEG_U * Math.max(1, Math.max(shape.p, shape.q) / 3))
  const count = segU * SEG_V
  const pos = new Float32Array(count * 3)
  const nrm = new Float32Array(count * 3)
  const eps = 1e-3
  let k = 0
  for (let i = 0; i < segU; i++) {
    const t = (i / segU) * Math.PI * 2
    const c = knotPoint(t, shape)
    const tangent = norm(sub(knotPoint(t + eps, shape), knotPoint(t - eps, shape)))
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

export interface Frame {
  cols: number
  rows: number
  charAspect: number
  rotX: number
  rotY: number
  rotZ: number
}

export function renderFrame(geo: Geometry, f: Frame, zbuf: Float32Array, out: Uint8Array): string {
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

/** One-off frame for static output (covers). Allocates its own buffers. */
export function renderKnotText(frame: Frame, geo: Geometry = buildGeometry()): string {
  const size = frame.cols * frame.rows
  return renderFrame(geo, frame, new Float32Array(size), new Uint8Array(size))
}

const geometryCache = new Map<string, Geometry>()

/** Memoised geometry per shape: building one costs ~20k samples, frames only rotate it. */
export function getGeometry(shape: KnotShape = TREFOIL): Geometry {
  const key = `${shape.p},${shape.q}`
  let geo = geometryCache.get(key)
  if (!geo) {
    geo = buildGeometry(shape)
    geometryCache.set(key, geo)
  }
  return geo
}

/** Deterministic 32-bit FNV-1a hash, used to give each slug its own knot angle. */
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

