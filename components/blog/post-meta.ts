import { readingTime } from '@/components/blog/ArticleLayout'
import { spine } from '@/lib/ascii/fingerprint'
import type { PostSummary } from '@/components/blog/PostRow'

/** Add reading time + structure spine, and drop the markdown so it never reaches the client. */
export function withPostMeta<T extends PostSummary & { content?: string | null }>(rows: T[]): PostSummary[] {
  return rows.map(({ content, ...post }) => ({
    ...post,
    minutes: content ? readingTime(content) : null,
    spine: content ? spine(content, 36) : null,
  }))
}
