import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import BlogList from '@/components/sections/BlogList'
import PageHeader from '@/components/ui/PageHeader'
import type { PostSummary } from '@/components/blog/PostRow'

export const metadata: Metadata = {
  title: 'Blog — Joey Chen',
  description: 'Thoughts on blockchain, code, and creativity.',
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
    console.error('[blog] failed to load posts', err)
  }

  const viewCounts = await getViewCounts(posts.map(p => `/blog/${p.slug}`))

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader eyebrow="~/blog" title="Writing" description="Thoughts on blockchain, code, and creativity." />
      <BlogList posts={posts} viewCounts={viewCounts} />
    </div>
  )
}
