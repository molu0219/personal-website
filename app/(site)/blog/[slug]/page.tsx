import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import ArticleLayout from '@/components/blog/ArticleLayout'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('posts').select('*').eq('slug', slug).eq('published', true).single()
    post = data
  } catch {}

  if (!post) notFound()

  return (
    <ArticleLayout post={post}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
      >
        {post.content}
      </ReactMarkdown>
    </ArticleLayout>
  )
}
