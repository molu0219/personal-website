import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import { withPostMeta } from '@/components/blog/post-meta'
import PageHeader from '@/components/ui/PageHeader'
import BlogExplorer from '@/components/blog/BlogExplorer'
import AsciiArt from '@/components/art/AsciiArt'
import { contentArt } from '@/lib/ascii/motifs'
import type { PostSummary } from '@/components/blog/PostRow'

export const metadata: Metadata = {
  title: 'Blog — Joey Chen',
  description: 'Joey Chen 的實作筆記：用 Claude Code 與 AI agent 開發的工作流、踩坑與工具，以及鏈上專案的紀錄。',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  let rows: (PostSummary & { content?: string | null })[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('id,slug,title,excerpt,tags,published_at,content')
      .eq('published', true)
      .order('published_at', { ascending: false })
    rows = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[blog] failed to load posts', err)
  }

  // Preview art is rendered here so the markdown never reaches the client.
  const previews: Record<string, React.ReactNode> = {}
  for (const p of rows) {
    previews[p.slug] = (
      <AsciiArt grid={contentArt({ content: p.content ?? '', seed: p.slug, tags: p.tags }, 84, 26)} className="p-2 text-[5px] leading-[6.5px]" />
    )
  }
  const posts = withPostMeta(rows)

  const viewCounts = await getViewCounts(posts.map(p => `/blog/${p.slug}`))

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader eyebrow="~/blog" title="Writing" description="Joey Chen 的實作筆記：用 Claude Code 與 AI agent 開發的工作流、踩坑與工具，以及鏈上專案的紀錄。" />
      <BlogExplorer posts={posts} previews={previews} views={viewCounts} />
    </div>
  )
}
