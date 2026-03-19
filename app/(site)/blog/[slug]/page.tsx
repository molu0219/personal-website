import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import ArticleLayout from '@/components/blog/ArticleLayout'
import AuthorCard from '@/components/blog/AuthorCard'
import { getViewCount } from '@/lib/view-counts'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('title, excerpt').eq('slug', slug).eq('published', true).single()
    if (data) return { title: `${data.title} — Joey Chen`, description: data.excerpt || undefined }
  } catch {}
  return { title: 'Blog — Joey Chen' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('*').eq('slug', slug).eq('published', true).single()
    post = data
  } catch {}

  if (!post) notFound()

  const views = await getViewCount(`/blog/${slug}`)

  return (
    <ArticleLayout post={post} views={views}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
      >
        {post.content}
      </ReactMarkdown>
      <AuthorCard />
    </ArticleLayout>
  )
}
