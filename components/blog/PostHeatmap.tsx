'use client'

import Link from 'next/link'
import type { PostSummary } from '@/components/blog/PostRow'

const DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ROW_LABEL = ['M', '', 'W', '', 'F', '', '']
const mono = { fontFamily: 'var(--font-mono)' } as const

interface Props {
  posts: PostSummary[]
  /** "YYYY-MM" currently filtering the explorer, or null. */
  month: string | null
  onMonth: (m: string | null) => void
}

const ymd = (d: Date) => d.toISOString().slice(0, 10)

/** Longest run of consecutive days with at least one post. */
function longestStreak(days: string[]): number {
  const sorted = Array.from(new Set(days)).sort()
  let best = 0
  let run = 0
  let prev = 0
  for (const d of sorted) {
    const t = Date.parse(d)
    run = t - prev === DAY ? run + 1 : 1
    best = Math.max(best, run)
    prev = t
  }
  return best
}

/**
 * GitHub-style contribution grid of the latest post's year, drawn in glyphs: one column per week,
 * one row per weekday. Days with posts link to the post; month labels filter the explorer below.
 */
export default function PostHeatmap({ posts, month, onMonth }: Props) {
  const dated = posts.filter(p => p.published_at)
  if (dated.length === 0) return null
  const year = Number(dated[0].published_at!.slice(0, 4))
  const byDay = new Map<string, PostSummary[]>()
  for (const p of dated) {
    const d = p.published_at!.slice(0, 10)
    if (d.startsWith(String(year))) byDay.set(d, [...(byDay.get(d) ?? []), p])
  }

  // Grid starts on the Monday on/before Jan 1.
  const jan1 = new Date(Date.UTC(year, 0, 1))
  const start = new Date(jan1.getTime() - ((jan1.getUTCDay() + 6) % 7) * DAY)
  const weeks = Math.ceil((Date.UTC(year, 11, 31) - start.getTime()) / DAY / 7) + 1
  const monthCols = MONTHS.map((_, m) => Math.floor((Date.UTC(year, m, 1) - start.getTime()) / DAY / 7))
  const monthCounts = MONTHS.map((_, m) => dated.filter(p => p.published_at!.startsWith(`${year}-${String(m + 1).padStart(2, '0')}`)).length)
  const busiest = monthCounts.indexOf(Math.max(...monthCounts))

  return (
    <section className="py-10 border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="overflow-x-auto">
        <div className="inline-block text-[11px] leading-[16px]" style={mono}>
          {/* month labels: click to filter */}
          <div className="relative h-5 ml-6" style={{ width: `${weeks * 1.6}em` }}>
            {MONTHS.map((name, m) => {
              const key = `${year}-${String(m + 1).padStart(2, '0')}`
              const on = month === key
              const has = monthCounts[m] > 0
              return (
                <button
                  key={name}
                  type="button"
                  disabled={!has}
                  onClick={() => onMonth(on ? null : key)}
                  aria-pressed={on}
                  className="absolute top-0 rounded px-0.5 transition-colors disabled:cursor-default"
                  style={{
                    left: `${monthCols[m] * 1.6}em`,
                    color: on ? 'var(--bg)' : has ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: on ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {name}
                </button>
              )
            })}
          </div>
          {ROW_LABEL.map((label, dow) => (
            <div key={dow} className="flex whitespace-pre">
              <span className="inline-block w-6" style={{ color: 'var(--text-muted)' }}>
                {label}
              </span>
              {Array.from({ length: weeks }, (_, w) => {
                const date = new Date(start.getTime() + (w * 7 + dow) * DAY)
                const key = ymd(date)
                const inYear = date.getUTCFullYear() === year
                const ps = byDay.get(key)
                const dimmed = month && !key.startsWith(month)
                if (!ps)
                  return (
                    <span key={w} className="inline-block w-[1.6em] text-center" style={{ color: inYear ? 'var(--border-strong)' : 'transparent' }}>
                      .
                    </span>
                  )
                return (
                  <Link
                    key={w}
                    href={`/blog/${ps[0].slug}`}
                    title={`${key} · ${ps.map(p => p.title).join(' / ')}`}
                    className="inline-block w-[1.6em] text-center transition-transform duration-150 hover:scale-150"
                    style={{ color: dimmed ? 'var(--text-muted)' : 'var(--accent)', fontWeight: 600 }}
                  >
                    {ps.length > 1 ? '@' : '#'}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
        {year} · {byDay.size} writing days · longest streak {longestStreak(Array.from(byDay.keys()))} days · busiest{' '}
        {MONTHS[busiest]} ({monthCounts[busiest]}) · click a month to filter, a mark to open
      </p>
    </section>
  )
}
