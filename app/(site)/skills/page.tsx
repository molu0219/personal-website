import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getViewCount } from '@/lib/view-counts'
import SkillsView from '@/components/skills/SkillsView'

export const metadata: Metadata = {
  title: 'Skills Hub — Joey Chen',
  description: 'Curated collection of AI agent skills. Select and generate install scripts.',
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
  } catch {}

  const views = await getViewCount('/skills')

  return (
    <div className="relative z-10 min-h-screen px-6 pt-32 pb-20 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <p
            className="font-mono uppercase text-xs"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
          >
            Skills Hub
          </p>
          {views > 0 && (
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {views.toLocaleString()} views
            </span>
          )}
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          AI <span className="gradient-text">Skills Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Curated collection of AI agent skills. Select, sort, and generate a single install script.
        </p>
      </div>

      <SkillsView skills={skills} />
    </div>
  )
}
