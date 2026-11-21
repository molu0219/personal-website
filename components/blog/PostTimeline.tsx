import Link from 'next/link'
import type { PostSummary } from '@/components/blog/PostRow'

const BAR = 10 // glyphs; one per minute, capped
const mono = { fontFamily: 'var(--font-mono)' } as const

function Bar({ minutes }: { minutes: number }) {
  const n = Math.min(BAR, Math.max(1, minutes))
  return (
    <span aria-label={`${minutes} min read`} className="whitespace-pre">
      <span className="text-[var(--text-secondary)] transition-colors duration-150 group-hover:text-[var(--accent)]">
        {'#'.repeat(n)}
      </span>
      <span style={{ color: 'var(--border-strong)' }}>{'.'.repeat(BAR - n)}</span>
    </span>
  )
}

/** Structure spine with each block type in its own tone. */
function Spine({ value }: { value: string }) {
  const tone: Record<string, string> = {
    '#': 'var(--accent)',
    '+': 'var(--text-secondary)',
    '%': 'var(--a6-hi)',
    '=': 'var(--a7-hi)',
    '*': 'var(--text-secondary)',
  }
  return (
    <span className="whitespace-pre opacity-60 transition-opacity duration-150 group-hover:opacity-100" aria-hidden>
      {Array.from(value).map((g, i) => (
        <span key={i} style={{ color: tone[g] ?? 'var(--text-muted)' }}>
          {g}
        </span>
      ))}
    </span>
  )
}

/**
 * Posts as a reading timeline: a rail with year markers; each post shows its date,
 * a glyph bar for reading time, the title, and a spine of its structure.
 */
export default function PostTimeline({ posts, views = {} }: { posts: PostSummary[]; views?: Record<string, number> }) {
  const yearOf = (p: PostSummary) => p.published_at?.slice(0, 4) ?? ''
  return (
    <ol className="relative">
      {posts.map((post, i) => {
        const y = yearOf(post)
        const showYear = i === 0 || yearOf(posts[i - 1]) !== y
        const v = views[`/blog/${post.slug}`]
        return (
          <li key={post.id}>
            {showYear && (
              <p className="pt-8 pb-2 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent)' }}>{y}</span> --+
              </p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="group relative grid gap-x-6 gap-y-1 border-l py-4 pl-6 transition-colors hover:border-[var(--accent)] md:grid-cols-[92px_1fr_auto]"
              style={{ borderColor: 'var(--border)' }}
            >
              <span
                aria-hidden
                className="absolute -left-px top-[1.55rem] h-px w-4 transition-[width,background-color] duration-150 group-hover:w-5 group-hover:bg-[var(--accent)]"
                style={{ background: 'var(--border-strong)' }}
              />
              <span className="text-xs leading-6" style={{ ...mono, color: 'var(--text-muted)' }}>
                {post.published_at?.slice(5, 10).replace('-', '.') ?? '--.--'}
              </span>
              <span className="min-w-0">
                <span
                  className="block font-medium leading-snug transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={mono}>
                  {post.minutes != null && (
                    <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <Bar minutes={post.minutes} />
                      {post.minutes} min
                    </span>
                  )}
                  {post.spine && <Spine value={post.spine} />}
                </span>
              </span>
              <span className="hidden md:flex items-start gap-3 pt-0.5 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
                {post.tags?.slice(0, 2).map(t => <span key={t}>#{t}</span>)}
                {v ? <span className="tabular-nums">{v} views</span> : null}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
