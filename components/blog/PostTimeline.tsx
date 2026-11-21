import Link from 'next/link'
import type { PostSummary } from '@/components/blog/PostRow'

const mono = { fontFamily: 'var(--font-mono)' } as const

/**
 * Posts as a reading timeline: a rail with year markers; each post shows its date,
 * its generated landscape thumbnail, the title and reading time.
 */
export default function PostTimeline({
  posts,
  views = {},
  thumbs = {},
}: {
  posts: PostSummary[]
  views?: Record<string, number>
  /** Server-rendered landscape thumbnails keyed by slug. */
  thumbs?: Record<string, React.ReactNode>
}) {
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
              className="group relative grid gap-x-6 gap-y-1 border-l py-4 pl-6 transition-colors hover:border-[var(--accent)] md:grid-cols-[64px_116px_1fr_auto] md:items-center"
              style={{ borderColor: 'var(--border)' }}
            >
              <span
                aria-hidden
                className="absolute -left-px top-1/2 h-px w-4 transition-[width,background-color] duration-150 group-hover:w-5 group-hover:bg-[var(--accent)]"
                style={{ background: 'var(--border-strong)' }}
              />
              <span className="text-xs leading-6" style={{ ...mono, color: 'var(--text-muted)' }}>
                {post.published_at?.slice(5, 10).replace('-', '.') ?? '--.--'}
              </span>
              <span className="hidden md:block transition-opacity duration-150 opacity-80 group-hover:opacity-100">
                {thumbs[post.slug]}
              </span>
              <span className="min-w-0">
                <span
                  className="block font-medium leading-snug transition-colors group-hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.title}
                </span>
                {post.minutes != null && (
                  <span className="mt-1 block text-[11px]" style={{ ...mono, color: 'var(--text-muted)' }}>
                    {post.minutes} min read
                  </span>
                )}
              </span>
              <span className="hidden md:flex items-center gap-3 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
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
