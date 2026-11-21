import Link from 'next/link'

export interface PostNavLink {
  slug: string
  title: string
}

function NavCard({ post, direction }: { post: PostNavLink; direction: 'prev' | 'next' }) {
  const isNext = direction === 'next'
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col gap-2 rounded-xl border p-5 transition-colors hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] ${isNext ? 'sm:text-right sm:col-start-2' : ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      <span className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {isNext ? 'Newer →' : '← Older'}
      </span>
      <span
        className="font-medium leading-snug line-clamp-2 transition-colors group-hover:text-[var(--accent)]"
        style={{ color: 'var(--text-primary)' }}
      >
        {post.title}
      </span>
    </Link>
  )
}

/** Older / newer post links at the end of an article. */
export default function PostNav({ older, newer }: { older: PostNavLink | null; newer: PostNavLink | null }) {
  if (!older && !newer) return null
  return (
    <nav aria-label="More posts" className="mt-16 grid gap-4 sm:grid-cols-2">
      {older && <NavCard post={older} direction="prev" />}
      {newer && <NavCard post={newer} direction="next" />}
    </nav>
  )
}
