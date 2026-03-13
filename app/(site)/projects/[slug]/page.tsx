import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import ProjectLayout from '@/components/project/ProjectLayout'

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let project: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('projects').select('*').eq('slug', slug).eq('published', true).single()
    project = data
  } catch {}

  if (!project) notFound()

  return (
    <ProjectLayout project={project}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}
      >
        {project.content}
      </ReactMarkdown>
    </ProjectLayout>
  )
}
