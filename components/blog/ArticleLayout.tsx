import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'
import TableOfContents from './TableOfContents'
import AsciiBanner from '@/components/art/AsciiBanner'

interface Post {
  slug: string
  title: string
  excerpt?: string | null
  content: string
  published_at?: string | null
  tags?: string[] | null
  cover_url?: string | null
}

const CJK_CHARS_PER_MIN = 400
const WORDS_PER_MIN = 220

/** Mixed zh/en estimate: CJK counted per character, the rest per word. */
export function readingTime(content: string): number {
  const cjk = content.match(/[㐀-鿿豈-﫿]/g)?.length ?? 0
  const words = content.replace(/[㐀-鿿豈-﫿]/g, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(cjk / CJK_CHARS_PER_MIN + words / WORDS_PER_MIN))
}

export default function ArticleLayout({
  post,
  children,
  views,
}: {
  post: Post
  children: React.ReactNode
  views?: number
}) {
  const meta = [
    post.published_at
      ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
      : null,
    `${readingTime(post.content)} min read`,
    views != null && views > 0 ? `${views.toLocaleString()} views` : null,
  ].filter(Boolean)

  return (
    <>
      {/* Scroll-driven progress bar: pure CSS, no scroll listener. */}
      <div className="reading-progress" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-16">
          <article className="min-w-0 max-w-[68ch]">
            <Link
              href="/blog"
              className="inline-block mb-10 text-xs transition-colors hover:text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
            >
              ← ~/blog
            </Link>

            <h1
              className="text-3xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.03em]"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {post.title}
            </h1>

            <p className="mt-6 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {meta.join('  ·  ')}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map(tag => <NeonBadge key={tag}>{tag}</NeonBadge>)}
              </div>
            )}

            {post.excerpt && (
              <p
                className="mt-8 pb-8 text-lg leading-relaxed border-b"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
              >
                {post.excerpt}
              </p>
            )}

            <AsciiBanner seed={post.slug} className="mt-10" />

            <div className="prose-theme mt-10">{children}</div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
