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
    const { data } = await supabase.from('posts').select('title, excerpt, excerpt_en, cover_url').eq('slug', slug).eq('published', true).single()
    if (data) {
      const title = `${data.title} — Joey Chen`
      const description = data.excerpt_en || data.excerpt || undefined
      return {
        title,
        description,
        alternates: { canonical: `/blog/${slug}` },
        openGraph: {
          title,
          description,
          url: `https://0xjoeytw.xyz/blog/${slug}`,
          type: 'article',
          siteName: 'Joey Chen',
          locale: 'zh_TW',
          ...(data.cover_url ? { images: [{ url: data.cover_url }] } : {}),
        },
        twitter: {
          card: data.cover_url ? 'summary_large_image' : 'summary',
          title,
          description,
          creator: '@0xjoeytw',
          ...(data.cover_url ? { images: [data.cover_url] } : {}),
        },
      }
    }
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

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://0xjoeytw.xyz/blog/${slug}#article`,
    headline: post.title,
    description: post.excerpt_en || post.excerpt || undefined,
    url: `https://0xjoeytw.xyz/blog/${slug}`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      '@type': 'Person',
      '@id': 'https://0xjoeytw.xyz/#person',
      name: 'Joey Chen',
      url: 'https://0xjoeytw.xyz',
    },
    publisher: {
      '@type': 'Person',
      '@id': 'https://0xjoeytw.xyz/#person',
      name: 'Joey Chen',
    },
    ...(post.cover_url ? { image: post.cover_url } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://0xjoeytw.xyz/blog/${slug}` },
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
    inLanguage: 'zh-TW',
  }

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0xjoeytw.xyz' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://0xjoeytw.xyz/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://0xjoeytw.xyz/blog/${slug}` },
    ],
  }

  return (
    <ArticleLayout post={post} views={views}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
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
