import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { renderCover } from '@/lib/og/cover'
import { formatPostDate } from '@/components/blog/PostRow'

export { postCoverUrl } from '@/lib/og/urls'

interface PostCoverRow {
  title: string
  tags: string[] | null
  published_at: string | null
  content: string | null
}

/** Returns null when the post does not exist or is unpublished. */
export async function renderPostCover(slug: string) {
  let post: PostCoverRow | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('title,tags,published_at,content')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    post = data
  } catch (err) {
    unstable_rethrow(err)
    console.error('[og] failed to load post', slug, err)
  }

  if (!post) return null
  const meta = [formatPostDate(post.published_at), ...(post.tags ?? []).slice(0, 2)].join('  ·  ')
  return renderCover({ section: '~/blog', title: post.title, meta, path: `~/blog/${slug}.md`, content: post.content ?? '', seed: slug, tags: post.tags })
}

/** Generic cover for when the post cannot be loaded. */
export const renderFallbackCover = (slug: string) =>
  renderCover({ section: '~/blog', title: 'Joey Chen', meta: '0xjoeytw.xyz', path: `~/blog/${slug}.md`, content: '', seed: slug })
