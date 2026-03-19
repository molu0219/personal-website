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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('projects').select('title, description').eq('slug', slug).eq('published', true).single()
    if (data) return { title: `${data.title} — Joey Chen`, description: data.description || undefined }
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

  return (
    <ProjectLayout project={project} views={views}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
      >
        {project.content}
      </ReactMarkdown>
      <AuthorCard />
    </ProjectLayout>
  )
}
