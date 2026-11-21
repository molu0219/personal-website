import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCount } from '@/lib/view-counts'
import SkillsView from '@/components/skills/SkillsView'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Skills Hub — Joey Chen',
  description: 'Curated collection of AI agent skills. Select and generate install scripts.',
  alternates: { canonical: '/skills' },
}

export default async function SkillsPage() {
  let skills: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('skills')
      .select('id, name, description, repo_url, install_command, claude_install_command, stars, forks')
      .eq('published', true)
      .order('stars', { ascending: false })
    skills = data ?? []
  } catch (err) {
    unstable_rethrow(err)
    console.error('[skills] failed to load skills', err)
  }

  const views = await getViewCount('/skills')

  return (
    <div className="px-6 pb-24 max-w-6xl mx-auto">
      <PageHeader
        eyebrow={views > 0 ? `~/skills · ${views.toLocaleString()} views` : '~/skills'}
        title="Skills Hub"
        description="Curated AI agent skills. Select, sort, and generate a single install script."
      />
      <div className="pt-10" />
      <SkillsView skills={skills} />
    </div>
  )
}
