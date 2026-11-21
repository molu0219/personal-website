import { readingTime } from '@/components/blog/ArticleLayout'
import type { PostSummary } from '@/components/blog/PostRow'

/** Add reading time, and drop the markdown so it never reaches the client. */
export function withPostMeta<T extends PostSummary & { content?: string | null }>(rows: T[]): PostSummary[] {
  return rows.map(({ content, ...post }) => ({
    ...post,
    minutes: content ? readingTime(content) : null,
  }))
}
