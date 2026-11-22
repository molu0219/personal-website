import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCounts } from '@/lib/view-counts'
import PageHeader from '@/components/ui/PageHeader'
import type { ProjectSummary } from '@/components/project/ProjectCard'
import AsciiBars from '@/components/art/AsciiBars'
import Link from 'next/link'
import ProjectMap from '@/components/project/ProjectMap'
import AsciiArt from '@/components/art/AsciiArt'
import { contentArt } from '@/lib/ascii/motifs'
import { layoutProjectMap } from '@/lib/ascii/project-map'

export const metadata: Metadata = {
  title: 'Projects — Joey Chen',
  description: 'Blockchain, AI, and Web3 projects by Joey Chen.',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  let rows: (ProjectSummary & { content?: string | null; featured?: boolean | null })[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('id,slug,title,description,tags,featured,created_at,content')
      .eq('published', true)
      .order('created_at', { ascending: false })
    rows = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[projects] failed to load projects', err)
  }

  const viewCounts = await getViewCounts(rows.map(p => `/projects/${p.slug}`))
  const layout = layoutProjectMap(rows)
  // Side-panel art, rendered on the server so the markdown never ships to the client.
  const arts: Record<string, React.ReactNode> = {}
  const minis: Record<string, React.ReactNode> = {}
  for (const p of rows) {
    minis[p.slug] = (
      <AsciiArt grid={contentArt({ content: p.content ?? '', seed: p.slug, tags: p.tags }, 34, 12)} className="text-[3.5px] leading-[4.5px] p-1.5 sm:text-[4.5px] sm:leading-[5.5px]" />
    )
    arts[p.slug] = (
      <AsciiArt grid={contentArt({ content: p.content ?? '', seed: p.slug, tags: p.tags }, 100, 34)} className="text-[5.5px] leading-[7px] p-3" />
    )
  }
  const projects = rows.map(({ id, slug, title, description, tags, featured, created_at }) => ({ id, slug, title, description, tags, featured, created_at }))
  const initial = (rows.find(p => p.featured) ?? rows[0])?.slug ?? ''

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader
        aside={<AsciiBars command="$ cat */stack | sort | uniq -c | head" rows={topTags(projects)} />}
        eyebrow="~/projects"
        title="Projects"
        description="Blockchain, AI, Web3 and open-source work — mapped by what they share."
      />
      {projects.length > 0 && (
        <ProjectMap layout={layout} projects={projects} arts={arts} minis={minis} views={viewCounts} initial={initial} />
      )}
      {/* Plain index for small screens and assistive tech. */}
      <ul className="lg:hidden border-t pt-6 space-y-3" style={{ borderColor: 'var(--border)' }}>
        {projects.map(p => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`} className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
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
