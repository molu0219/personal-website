import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { renderCover } from '@/lib/og/cover'

interface ProjectCoverRow {
  title: string
  tags: string[] | null
  content: string | null
}

/** Returns null when the project does not exist or is unpublished. */
export async function renderProjectCover(slug: string) {
  let project: ProjectCoverRow | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('title,tags,content')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    project = data
  } catch (err) {
    unstable_rethrow(err)
    console.error('[og] failed to load project', slug, err)
  }

  if (!project) return null
  const meta = (project.tags ?? []).slice(0, 3).join('  ·  ')
  return renderCover({
    section: '~/projects',
    title: project.title,
    meta,
    path: `~/projects/${slug}/README.md`,
    content: project.content ?? '',
    seed: slug,
    tags: project.tags,
  })
}

export const renderFallbackProjectCover = (slug: string) =>
  renderCover({ section: '~/projects', title: 'Joey Chen', meta: '0xjoeytw.xyz', path: `~/projects/${slug}`, content: '', seed: slug })
