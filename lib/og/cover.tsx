import { ImageResponse } from 'next/og'
import { getGeometry, hashSeed, renderKnotText, type KnotShape } from '@/lib/ascii-knot'
import { loadGoogleFont, type OgFont } from '@/lib/og/fonts'

export const COVER_SIZE = { width: 1200, height: 630 }

// Dark theme tokens from app/globals.css; covers are always dark so they read in feeds.
const C = {
  bg: '#0a0a0a',
  text: '#ededeb',
  secondary: '#a3a39c',
  muted: '#6b6b65',
  knot: '#5c5c56',
  accent: '#ff7a2e',
  border: '#232323',
}

// ASCII knot block on the right half.
const KNOT_FONT_PX = 11
const KNOT_CHAR_ASPECT = 0.6 // Geist Mono advance / line height at lineHeight = 1
const KNOT_WIDTH = 520
const KNOT_COLS = Math.floor(KNOT_WIDTH / (KNOT_FONT_PX * KNOT_CHAR_ASPECT))
const KNOT_ROWS = Math.floor(COVER_SIZE.height / KNOT_FONT_PX)
const RAMP_CHARS = ' .,-~:;=!*#$@'

export interface CoverInput {
  /** Path shown top-left, e.g. "~/blog". */
  section: string
  title: string
  /** Bottom meta line, e.g. date and tags. */
  meta: string
  /** Stable seed (slug) so every post gets its own knot angle. */
  seed: string
  /** 'art' drops the title for in-page thumbnails that already show it as text. */
  variant?: 'full' | 'art'
  /** Knot winding numbers; each section has its own (blog trefoil, projects (2,5)). */
  shape?: KnotShape
}

function knotFor(seed: string, shape?: KnotShape): string[] {
  const h = hashSeed(seed)
  const angle = (shift: number) => (((h >>> shift) & 0xff) / 255) * Math.PI * 2
  return renderKnotText({
    cols: KNOT_COLS,
    rows: KNOT_ROWS,
    charAspect: KNOT_CHAR_ASPECT,
    // Stay near the hero's three-quarter view so the knot never collapses edge-on.
    rotX: 0.75 + (angle(0) / (Math.PI * 2)) * 0.5,
    rotY: (angle(8) / (Math.PI * 2) - 0.5) * 0.9,
    rotZ: angle(16),
  }, getGeometry(shape)).split('\n')
}

function titleSize(title: string): number {
  // CJK glyphs are ~2x as wide as Latin; size by visual length.
  const len = Array.from(title).reduce((n, ch) => n + (ch.charCodeAt(0) > 0x2e80 ? 2 : 1), 0)
  if (len <= 28) return 68
  if (len <= 48) return 58
  return 48
}

async function loadFonts(input: CoverInput): Promise<OgFont[]> {
  const chrome = `${input.section}${input.meta}joey@chen`
  const results = await Promise.allSettled([
    loadGoogleFont('Noto Sans TC', 500, input.title),
    loadGoogleFont('Geist Mono', 400, `${RAMP_CHARS}${chrome}`),
    // CJK fallback for tags / meta written in Chinese.
    loadGoogleFont('Noto Sans TC', 400, chrome),
  ])
  const fonts = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []))
  results.forEach(r => r.status === 'rejected' && console.error(r.reason))
  return fonts
}

// Plain function, not a component: satori does not render fragments returned by components.
function knotLines(lines: string[]) {
  return lines.map((line, i) => (
    <div key={i} style={{ display: 'flex', flexShrink: 0, whiteSpace: 'pre', height: KNOT_FONT_PX }}>
      {line}
    </div>
  ))
}

/** Title-less thumbnail: just the post's knot, centered. */
async function renderArt(input: CoverInput): Promise<ImageResponse> {
  const fonts = await loadGoogleFont('Geist Mono', 400, RAMP_CHARS)
    .then(f => [f])
    .catch(err => (console.error(err), [] as OgFont[]))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: (COVER_SIZE.width - KNOT_WIDTH) / 2,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            width: KNOT_WIDTH,
            height: '100%',
            fontFamily: 'Geist Mono',
            fontSize: KNOT_FONT_PX,
            lineHeight: 1,
            color: C.secondary,
          }}
        >
          {knotLines(knotFor(input.seed, input.shape))}
        </div>
      </div>
    ),
    { ...COVER_SIZE, ...(fonts.length > 0 ? { fonts } : {}) },
  )
}

export async function renderCover(input: CoverInput): Promise<ImageResponse> {
  if (input.variant === 'art') return renderArt(input)
  const [fonts, knot] = await Promise.all([loadFonts(input), Promise.resolve(knotFor(input.seed, input.shape))])
  const mono = 'Geist Mono, Noto Sans TC'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: C.bg, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: KNOT_WIDTH,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: mono,
            fontSize: KNOT_FONT_PX,
            lineHeight: 1,
            color: C.knot,
          }}
        >
          {knotLines(knot)}
        </div>

        {/* Neutral mask so the title sits on calm space where it overlaps the knot. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage: `linear-gradient(90deg, ${C.bg} 0%, ${C.bg} 48%, rgba(10,10,10,0.6) 62%, rgba(10,10,10,0) 78%)`,
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '64px 72px',
          }}
        >
          <div style={{ display: 'flex', fontFamily: mono, fontSize: 22, color: C.muted }}>{input.section}</div>

          <div
            style={{
              display: 'flex',
              maxWidth: 680,
              fontFamily: 'Noto Sans TC',
              fontWeight: 500,
              fontSize: titleSize(input.title),
              lineHeight: 1.18,
              letterSpacing: '-0.01em',
              color: C.text,
            }}
          >
            {input.title}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 24,
              borderTop: `1px solid ${C.border}`,
              fontFamily: mono,
              fontSize: 20,
              color: C.secondary,
            }}
          >
            <div style={{ display: 'flex' }}>
              joey<span style={{ color: C.accent }}>@</span>chen
            </div>
            <div style={{ display: 'flex', color: C.muted }}>{input.meta}</div>
          </div>
        </div>
      </div>
    ),
    // An empty `fonts` array disables next/og's bundled default; omit it so a font outage
    // degrades to Latin-only text instead of a 500.
    { ...COVER_SIZE, ...(fonts.length > 0 ? { fonts } : {}) },
  )
}
