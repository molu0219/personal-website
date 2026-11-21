import Link from 'next/link'
import { formatPostDate, type PostSummary } from '@/components/blog/PostRow'
import { postCoverUrl } from '@/lib/og/urls'

/** Latest post, shown above the list with its generated cover art. */
export default function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-6 py-10 border-b md:grid-cols-[1.15fr_1fr] md:items-center md:gap-10"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        className="overflow-hidden rounded-xl border aspect-[1200/630]"
        style={{ borderColor: 'var(--border)', background: '#0a0a0a' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- generated PNG, images are unoptimized site-wide */}
        <img
          src={postCoverUrl(post.slug, 'art')}
          alt=""
          width={1200}
          height={630}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

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
