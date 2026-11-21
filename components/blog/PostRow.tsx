import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'

export interface PostSummary {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  tags?: string[] | null
  published_at?: string | null
}

export function formatPostDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

export default function PostRow({ post, views }: { post: PostSummary; views?: number }) {
  return (
    <li className="border-b" style={{ borderColor: 'var(--border)' }}>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-1 py-5 md:grid-cols-[140px_1fr_auto] md:items-baseline md:gap-6"
      >
        <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {formatPostDate(post.published_at)}
        </span>
        <span>
          <span
            className="block font-medium transition-colors group-hover:text-[var(--accent)]"
            style={{ color: 'var(--text-primary)' }}
          >
            {post.title}
          </span>
          {post.excerpt && (
            <span className="mt-1 block text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
              {post.excerpt}
            </span>
          )}
        </span>
        <span className="hidden md:flex items-center gap-1.5">
          {post.tags?.slice(0, 2).map(tag => <NeonBadge key={tag}>{tag}</NeonBadge>)}
          {views != null && views > 0 && (
            <span className="ml-2 text-xs tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {views.toLocaleString()} views
            </span>
          )}
        </span>
      </Link>
    </li>
  )
}
