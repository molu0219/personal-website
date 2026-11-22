import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import ProjectLayout from '@/components/project/ProjectLayout'
import AuthorCard from '@/components/blog/AuthorCard'
import { getViewCount } from '@/lib/view-counts'
import { MARKDOWN_COMPONENTS } from '@/components/blog/markdown'
import { projectCoverUrl } from '@/lib/og/urls'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('projects').select('title, description').eq('slug', slug).eq('published', true).single()
    if (data) {
      const title = `${data.title} — Joey Chen`
      const description = data.description || undefined
      return {
        title,
        description,
        alternates: { canonical: `/projects/${slug}` },
        openGraph: {
          title,
          description,
          url: `https://0xjoeytw.xyz/projects/${slug}`,
          type: 'article',
          siteName: 'Joey Chen',
          locale: 'zh_TW',
        },
        twitter: {
          // Images come from the generated opengraph-image / twitter-image routes.
          card: 'summary_large_image',
          title,
          description,
          creator: '@0xjoeytw',
        },
      }
    }
  } catch {}
  return { title: 'Projects — Joey Chen' }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let project: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('projects').select('*').eq('slug', slug).eq('published', true).single()
    project = data
  } catch {}

  if (!project) notFound()

  const views = await getViewCount(`/projects/${slug}`)

  const url = `https://0xjoeytw.xyz/projects/${slug}`
  // Code projects are SoftwareSourceCode (with their repository); others fall back to CreativeWork.
  const jsonLdProject = {
    '@context': 'https://schema.org',
    '@type': project.github_url ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${url}#project`,
    name: project.title,
    description: project.description || undefined,
    url,
    image: `https://0xjoeytw.xyz${projectCoverUrl(slug)}`,
    ...(project.github_url ? { codeRepository: project.github_url } : {}),
    ...(project.url ? { sameAs: [project.url] } : {}),
    author: { '@type': 'Person', '@id': 'https://0xjoeytw.xyz/#person', name: 'Joey Chen', url: 'https://0xjoeytw.xyz' },
    dateCreated: project.created_at || undefined,
    dateModified: project.updated_at || project.created_at || undefined,
    ...(project.tags?.length ? { keywords: project.tags.join(', ') } : {}),
    inLanguage: 'zh-TW',
  }
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://0xjoeytw.xyz' },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://0xjoeytw.xyz/projects' },
      { '@type': 'ListItem', position: 3, name: project.title, item: url },
    ],
  }

  return (
    <ProjectLayout project={project} views={views}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProject) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <ReactMarkdown components={MARKDOWN_COMPONENTS}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
      >
        {project.content}
      </ReactMarkdown>
      <AuthorCard />
    </ProjectLayout>
  )
}
