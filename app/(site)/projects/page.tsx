import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import ProjectGrid from '@/components/sections/ProjectGrid'
import { splitProjectArt } from '@/components/project/ProjectCardArt'
import PageHeader from '@/components/ui/PageHeader'
import type { ProjectSummary } from '@/components/project/ProjectCard'
import AsciiBars from '@/components/art/AsciiBars'
import ContentArt from '@/components/art/ContentArt'
import FeaturedEntry from '@/components/ui/FeaturedEntry'

export const metadata: Metadata = {
  title: 'Projects — Joey Chen',
  description: 'Blockchain, AI, and Web3 projects by Joey Chen.',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  let projects: ProjectSummary[] = []
  let arts: Record<string, React.ReactNode> = {}
  let featured: (ProjectSummary & { content?: string | null }) | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id,slug,title,description,tags,featured,created_at,content')
      .eq('published', true)
      .order('created_at', { ascending: false })
    const rows = data ?? []
    // Pinned on top: the first project marked featured, otherwise the newest.
    featured = rows.find(p => p.featured) ?? rows[0] ?? null
    ;({ projects, arts } = splitProjectArt(rows.filter(p => p !== featured)))
  } catch (err) {
    unstable_rethrow(err)
    console.error('[projects] failed to load projects', err)
  }

  const viewCounts = await getViewCounts(projects.map(p => `/projects/${p.slug}`))
  const allForChart = featured ? [featured, ...projects] : projects

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader aside={<AsciiBars command="$ cat */stack | sort | uniq -c | head" rows={topTags(allForChart)} />} eyebrow="~/projects" title="Projects" description="Blockchain, AI, Web3 and open-source work." />
      {featured && (
        <FeaturedEntry
          href={`/projects/${featured.slug}`}
          label="featured"
          meta={(featured.tags ?? []).slice(0, 3).join(' · ')}
          title={featured.title}
          excerpt={featured.description}
          cta="Open project"
          art={
            <ContentArt
              content={featured.content ?? ''}
              seed={featured.slug}
              tags={featured.tags}
              cols={124}
              rows={44}
              glyphClass="text-[4px] leading-[5px] md:text-[7px] md:leading-[8px]"
            />
          }
        />
      )}
      <ProjectGrid projects={projects} viewCounts={viewCounts} arts={arts} />
    </div>
  )
}

/** Most-used tags across projects (case-insensitive), top 6. */
function topTags(projects: ProjectSummary[]) {
  const counts = new Map<string, number>()
  for (const p of projects) for (const t of p.tags ?? []) counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) ?? 0) + 1)
  return Array.from(counts, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 6)
}
