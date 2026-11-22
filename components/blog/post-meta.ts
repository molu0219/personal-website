import { readingTime } from '@/components/blog/ArticleLayout'
import { parseBlocks } from '@/lib/ascii/blocks'
import type { PostSummary } from '@/components/blog/PostRow'

const OUTLINE_MAX = 8

/** Add reading time + section outline, and drop the markdown so it never reaches the client. */
export function withPostMeta<T extends PostSummary & { content?: string | null }>(rows: T[]): PostSummary[] {
  return rows.map(({ content, ...post }) => ({
    ...post,
    minutes: content ? readingTime(content) : null,
    outline: content
      ? parseBlocks(content)
          .flatMap(b => (b.kind === 'heading' && b.level === 2 ? [b.text] : []))
          .slice(0, OUTLINE_MAX)
      : null,
  }))
}
