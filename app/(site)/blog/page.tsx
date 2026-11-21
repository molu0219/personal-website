import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import BlogList from '@/components/sections/BlogList'
import ContentArt from '@/components/art/ContentArt'
import AsciiBars from '@/components/art/AsciiBars'
import { withPostMeta } from '@/components/blog/post-meta'
import PageHeader from '@/components/ui/PageHeader'
import type { PostSummary } from '@/components/blog/PostRow'

export const metadata: Metadata = {
  title: 'Blog — Joey Chen',
  description: 'Notes on building with AI agents, Claude Code workflows, and on-chain work.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  let posts: PostSummary[] = []
  let latestContent = ''

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('id,slug,title,excerpt,tags,published_at,content')
      .eq('published', true)
      .order('published_at', { ascending: false })
    // Only the newest post's markdown is needed (for its fingerprint); keep it off the client payload.
    latestContent = data?.[0]?.content ?? ''
    posts = withPostMeta(data ?? [])
  } catch (err) {
    unstable_rethrow(err)
    console.error('[blog] failed to load posts', err)
  }

  const viewCounts = await getViewCounts(posts.map(p => `/blog/${p.slug}`))

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader aside={<AsciiBars command="$ git log --posts | cut -c1-7 | uniq -c" rows={postsPerMonth(posts)} />} eyebrow="~/blog" title="Writing" description="Notes on building with AI agents, Claude Code workflows, and on-chain work." />
      <BlogList
        posts={posts}
        viewCounts={viewCounts}
        featuredArt={
          posts[0] && (
            <ContentArt content={latestContent} seed={posts[0].slug} tags={posts[0].tags} cols={124} rows={44} glyphClass="text-[4px] leading-[5px] md:text-[7px] md:leading-[8px]" />
          )
        }
      />
    </div>
  )
}

/** Posts per month, oldest first, last 6 months that have posts. */
function postsPerMonth(posts: PostSummary[]) {
  const counts = new Map<string, number>()
  for (const p of posts) {
    const m = p.published_at?.slice(0, 7)
    if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
  }
  return Array.from(counts, ([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-6)
}
