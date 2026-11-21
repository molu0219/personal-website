import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import BlogList from '@/components/sections/BlogList'
import PageHeader from '@/components/ui/PageHeader'
import type { PostSummary } from '@/components/blog/PostRow'

export const metadata: Metadata = {
  title: 'Blog — Joey Chen',
  description: 'Notes on building with AI agents, Claude Code workflows, and on-chain work.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  let posts: PostSummary[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('id,slug,title,excerpt,tags,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
    posts = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[blog] failed to load posts', err)
  }

  const viewCounts = await getViewCounts(posts.map(p => `/blog/${p.slug}`))

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader eyebrow="~/blog" title="Writing" description="Notes on building with AI agents, Claude Code workflows, and on-chain work." />
      <BlogList posts={posts} viewCounts={viewCounts} />
    </div>
  )
}
