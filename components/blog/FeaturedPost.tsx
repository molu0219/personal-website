import Link from 'next/link'
import { formatPostDate, type PostSummary } from '@/components/blog/PostRow'
import AsciiBanner from '@/components/art/AsciiBanner'

/** Latest post, shown above the list with its generated cover art. */
export default function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-6 py-10 border-b md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10"
      style={{ borderColor: 'var(--border)' }}
    >
      <AsciiBanner seed={post.slug} />

      <div>
        <p className="mb-4 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)' }}>latest</span> · {formatPostDate(post.published_at)}
        </p>
        <h2
          className="text-2xl md:text-3xl font-medium leading-tight tracking-[-0.02em] transition-colors group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-4 text-[15px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt}
          </p>
        )}
        <p className="mt-6 text-sm" style={{ color: 'var(--text-primary)' }}>
          Read post <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </p>
      </div>
    </Link>
  )
}
