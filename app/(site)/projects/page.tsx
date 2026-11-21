import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import ProjectGrid from '@/components/sections/ProjectGrid'
import PageHeader from '@/components/ui/PageHeader'
import type { ProjectSummary } from '@/components/project/ProjectCard'

export const metadata: Metadata = {
  title: 'Projects — Joey Chen',
  description: 'Blockchain, AI, and Web3 projects by Joey Chen.',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  let projects: ProjectSummary[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id,slug,title,description,tags,cover_url,featured,created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
    projects = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[projects] failed to load projects', err)
  }

  const viewCounts = await getViewCounts(projects.map(p => `/projects/${p.slug}`))

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader knot={{ p: 2, q: 5 }} eyebrow="~/projects" title="Projects" description="Blockchain, AI, Web3 and open-source work." />
      <ProjectGrid projects={projects} viewCounts={viewCounts} />
    </div>
  )
}
