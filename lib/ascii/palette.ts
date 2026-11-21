// Material ids for coloured glyphs. CSS classes `.a{mat}s{shade}` live in app/globals.css
// (generated block "ASCII palette (F010)"), themed via --a{mat}-lo / --a{mat}-hi.
export const MAT = {
  noise: 0,
  ink: 1,
  accent: 2,
  signal: 3,
  hud: 4,
  ok: 5,
  code: 6,
  quote: 7,
} as const

export type Mat = (typeof MAT)[keyof typeof MAT]

export const SHADES = 6

/** Class for a material at luminance 0–1. */
export function glyphClass(mat: number, lum: number): string {
  const s = Math.min(SHADES - 1, Math.max(0, Math.floor(lum * SHADES)))
  return `a${mat}s${s}`
}

/** Sparse → dense luminance ramp (pure 7-bit ASCII). */
export const RAMP = ' .:-=+*#%@'

export function rampChar(lum: number, ramp: string = RAMP): string {
  const i = Math.round(Math.min(1, Math.max(0, lum)) * (ramp.length - 1))
  return ramp[i]
}

/** Outline glyph for a 2D gradient (sx right, sy up). */
export function edgeGlyph(sx: number, sy: number): string {
  const ax = Math.abs(sx)
  const ay = Math.abs(sy)
  if (ay < 0.38 * ax) return '|'
  if (ax < 0.38 * ay) return sy > 0 ? '-' : '_'
  return sx * sy > 0 ? '/' : '\\'
}
