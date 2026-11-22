import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import ProjectInline, { type InlineProject } from '@/components/project/ProjectInline'
import AsciiBars from '@/components/art/AsciiBars'
import ProjectMap from '@/components/project/ProjectMap'
import AsciiArt from '@/components/art/AsciiArt'
import { contentArt } from '@/lib/ascii/motifs'
import { layoutProjectMap } from '@/lib/ascii/project-map'

export const metadata: Metadata = {
  title: 'Projects — Joey Chen',
  description: 'Joey Chen 的作品：AI agent、交易監控與預測市場、Solana 代幣分析、3D 桌面夥伴與開發者工具，依共用技術畫成一張地圖。',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  let rows: (InlineProject & { id: string; featured?: boolean | null; created_at?: string | null })[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('id,slug,title,description,tags,featured,created_at,content,url,github_url')
      .eq('published', true)
      .order('created_at', { ascending: false })
    // Supabase reports query errors in `error` instead of throwing; don't let the page go silently empty.
    if (error) console.error('[projects] query failed', error.message)
    rows = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[projects] failed to load projects', err)
  }

  const layout = layoutProjectMap(rows)
  // Everything that needs the markdown is rendered here, on the server.
  const minis: Record<string, React.ReactNode> = {}
  const bodies: Record<string, React.ReactNode> = {}
  for (const p of rows) {
    minis[p.slug] = (
      <AsciiArt
        grid={contentArt({ content: p.content ?? '', seed: p.slug, tags: p.tags }, 34, 12)}
        className="p-1.5 text-[3.5px] leading-[4.5px] sm:text-[4.5px] sm:leading-[5.5px]"
      />
    )
    bodies[p.slug] = <ProjectInline project={p} />
  }
  const projects = rows.map(({ slug, title, description, tags }) => ({ slug, title, description, tags }))
  const initial = (rows.find(p => p.featured) ?? rows[0])?.slug ?? ''

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader
        aside={<AsciiBars command="$ cat */stack | sort | uniq -c | head" rows={topTags(projects)} />}
        eyebrow="~/projects"
        title="Projects"
        description="Blockchain, AI, Web3 and open-source work — mapped by what they share."
      />
      {projects.length > 0 && <ProjectMap layout={layout} projects={projects} minis={minis} bodies={bodies} initial={initial} />}
    </div>
  )
}

/** Most-used tags across projects (case-insensitive), top 6. */
function topTags(projects: { tags?: string[] | null }[]) {
  const counts = new Map<string, number>()
  for (const p of projects) for (const t of p.tags ?? []) counts.set(t.toLowerCase(), (counts.get(t.toLowerCase()) ?? 0) + 1)
  return Array.from(counts, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 6)
}
