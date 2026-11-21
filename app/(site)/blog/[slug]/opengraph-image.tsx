import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { COVER_SIZE, renderCover } from '@/lib/og/cover'
import { formatPostDate } from '@/components/blog/PostRow'

export const alt = 'Joey Chen — blog post'
export const size = COVER_SIZE
export const contentType = 'image/png'

interface PostCoverRow {
  title: string
  tags: string[] | null
  published_at: string | null
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post: PostCoverRow | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('title,tags,published_at')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    post = data
  } catch (err) {
    unstable_rethrow(err)
    console.error('[og] failed to load post', slug, err)
  }

  const meta = post
    ? [formatPostDate(post.published_at), ...(post.tags ?? []).slice(0, 2)].join('  ·  ')
    : ''
  return renderCover({ section: '~/blog', title: post?.title ?? 'Joey Chen', meta, seed: slug })
}
