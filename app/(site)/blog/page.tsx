import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BlogList from '@/components/sections/BlogList'

export const metadata: Metadata = {
  title: 'Blog — Joey Chen',
  description: 'Thoughts on blockchain, code, and creativity.',
}

export default async function BlogPage() {
  let posts: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('posts')
      .select('id,slug,title,excerpt,tags,cover_url,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
    posts = data ?? []
  } catch {}

  return (
    <div className="relative z-10 min-h-screen px-6 pt-32 pb-20 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          The <span className="gradient-text">Blog</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Thoughts on blockchain, code, and creativity.
        </p>
      </div>
      <BlogList posts={posts} />
    </div>
  )
}
