import type { AsciiGrid } from '@/lib/ascii/grid'
import { MAT } from '@/lib/ascii/palette'

/**
 * A procedural ASCII spider ("web crawler"): body chases a target, eight two-segment legs
 * keep their feet planted and step in an alternating gait, knees solved with 2-link IK.
 * All physics in CSS px; drawing converts to grid cells.
 */

interface Leg {
  side: 1 | -1
  /** Angle of the rest foot position relative to heading (rad). */
  restAngle: number
  restDist: number
  hipAngle: number
  group: 0 | 1
  foot: { x: number; y: number }
  from: { x: number; y: number }
  to: { x: number; y: number }
  /** 0..1 while stepping, -1 when planted. */
  t: number
}

const BODY_R = 11
const HIP_R = 8
const L1 = 54
const L2 = 62
const STEP_DIST = 42
const STEP_TIME = 0.11
const MAX_SPEED = 3200
const LEAD = 0.12 // s of velocity added to the step target, so feet land ahead of the body

const deg = (d: number) => (d * Math.PI) / 180
const LEG_LAYOUT: [number, number, number][] = [
  // rest angle, rest distance, hip angle (degrees, relative to heading; mirrored per side)
  [36, 96, 30],
  [76, 92, 65],
  [112, 92, 105],
  [152, 98, 140],
]

export class Spider {
  x: number
  y: number
  vx = 0
  vy = 0
  heading = -Math.PI / 2
  legs: Leg[] = []

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    let i = 0
    for (const side of [1, -1] as const)
      for (const [ra, rd, ha] of LEG_LAYOUT) {
        const leg: Leg = {
          side,
          restAngle: deg(ra) * side,
          restDist: rd,
          hipAngle: deg(ha) * side,
          group: ((i + (side === 1 ? 0 : 1)) % 2) as 0 | 1,
          foot: { x: 0, y: 0 },
          from: { x: 0, y: 0 },
          to: { x: 0, y: 0 },
          t: -1,
        }
        leg.foot = this.rest(leg, 0)
        this.legs.push(leg)
        i++
      }
  }

  private rest(leg: Leg, lead: number) {
    const a = this.heading + leg.restAngle
    return { x: this.x + Math.cos(a) * leg.restDist + this.vx * lead, y: this.y + Math.sin(a) * leg.restDist + this.vy * lead }
  }

  hip(leg: Leg) {
    const a = this.heading + leg.hipAngle
    return { x: this.x + Math.cos(a) * HIP_R, y: this.y + Math.sin(a) * HIP_R }
  }

  /** Planted feet (for decoding what the spider stands on). */
  feet() {
    return this.legs.filter(l => l.t < 0).map(l => l.foot)
  }

  step(dt: number, tx: number, ty: number) {
    dt = Math.min(dt, 0.05)
    // Body: critically-damped chase, capped speed.
    const dx = tx - this.x
    const dy = ty - this.y
    // Stiff chase so the body stays on the cursor; legs catch up via the stranded-foot rule.
    let vx = dx * 18
    let vy = dy * 18
    const sp = Math.hypot(vx, vy)
    if (sp > MAX_SPEED) {
      vx *= MAX_SPEED / sp
      vy *= MAX_SPEED / sp
    }
    this.vx += (vx - this.vx) * Math.min(1, dt * 30)
    this.vy += (vy - this.vy) * Math.min(1, dt * 30)
    this.x += this.vx * dt
    this.y += this.vy * dt
    if (Math.hypot(this.vx, this.vy) > 25) {
      const target = Math.atan2(this.vy, this.vx)
      let d = target - this.heading
      d = Math.atan2(Math.sin(d), Math.cos(d))
      this.heading += d * Math.min(1, dt * 6)
    }

    // Legs: alternate groups; a leg steps when it drifts too far from its rest pose.
    const stepping = [0, 0]
    for (const l of this.legs) if (l.t >= 0) stepping[l.group]++
    for (const l of this.legs) {
      if (l.t >= 0) {
        // Keep aiming at where the rest pose is now, so fast moves don't leave feet behind.
        l.to = this.rest(l, LEAD)
        l.t += dt / STEP_TIME
        const k = Math.min(1, l.t)
        const e = k * k * (3 - 2 * k)
        l.foot = { x: l.from.x + (l.to.x - l.from.x) * e, y: l.from.y + (l.to.y - l.from.y) * e }
        if (l.t >= 1) l.t = -1
        continue
      }
      const r = this.rest(l, 0)
      const drift = Math.hypot(l.foot.x - r.x, l.foot.y - r.y)
      // Normal gait alternates groups; a foot left far behind (fast chase) steps immediately.
      const stranded = drift > STEP_DIST * 2.2
      if (drift > STEP_DIST && (stepping[1 - l.group] === 0 || stranded)) {
        l.from = { ...l.foot }
        l.to = this.rest(l, LEAD)
        l.t = 0
        stepping[l.group]++
      }
    }
  }

  /** Knee for a hip→foot pair: 2-link IK, bending outward from the body and lifted mid-step. */
  knee(l: Leg) {
    const h = this.hip(l)
    const f = l.foot
    let dx = f.x - h.x
    let dy = f.y - h.y
    let d = Math.hypot(dx, dy) || 0.001
    const maxD = L1 + L2 - 0.5
    if (d > maxD) {
      dx *= maxD / d
      dy *= maxD / d
      d = maxD
    }
    const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))))
    const base = Math.atan2(dy, dx)
    const ang = base - a * l.side
    const lift = l.t >= 0 ? Math.sin(Math.PI * Math.min(1, l.t)) * 10 : 0
    return { x: h.x + Math.cos(ang) * L1, y: h.y + Math.sin(ang) * L1 - lift }
  }

  draw(g: AsciiGrid) {
    const cell = (px: number, py: number): [number, number] => [Math.round(px / g.cw), Math.round(py / g.ch)]
    for (const l of this.legs) {
      const h = this.hip(l)
      const k = this.knee(l)
      line(g, h, k, MAT.ink, 0.95)
      line(g, k, l.foot, MAT.ink, 0.8)
      const [kc, kr] = cell(k.x, k.y)
      g.set(kc, kr, 'o', MAT.accent, 1)
      const [fc, fr] = cell(l.foot.x, l.foot.y)
      g.set(fc, fr, l.t >= 0 ? '.' : '*', MAT.accent, 0.9)
    }
    // Abdomen behind, head ahead along the heading.
    const ax = this.x - Math.cos(this.heading) * 7
    const ay = this.y - Math.sin(this.heading) * 7
    const r = BODY_R
    for (let py = ay - r; py <= ay + r; py += g.ch * 0.5)
      for (let px = ax - r * 1.2; px <= ax + r * 1.2; px += g.cw * 0.5) {
        const d = Math.hypot((px - ax) / 1.2, py - ay) / r
        if (d > 1) continue
        const [c, rr] = cell(px, py)
        g.set(c, rr, d < 0.45 ? '@' : d < 0.8 ? '%' : '#', MAT.ink, 1)
      }
    const hx = this.x + Math.cos(this.heading) * 8
    const hy = this.y + Math.sin(this.heading) * 8
    const [hc, hr] = cell(hx, hy)
    g.set(hc, hr, 'O', MAT.ink, 1)
    const ex = this.x + Math.cos(this.heading) * 13
    const ey = this.y + Math.sin(this.heading) * 13
    const [ec, er] = cell(ex, ey)
    g.set(ec, er, ':', MAT.accent, 1) // eyes
  }
}

/** Rasterise a px-space segment into slope glyphs. */
function line(g: AsciiGrid, a: { x: number; y: number }, b: { x: number; y: number }, mat: number, lum: number) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const angle = ((Math.atan2(-dy, dx) * 180) / Math.PI + 180) % 180
  const ch = angle < 22.5 || angle >= 157.5 ? '-' : angle < 67.5 ? '/' : angle < 112.5 ? '|' : '\\'
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx) / g.cw, Math.abs(dy) / g.ch) * 1.5))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    g.set(Math.round((a.x + dx * t) / g.cw), Math.round((a.y + dy * t) / g.ch), ch, mat, lum)
  }
}
