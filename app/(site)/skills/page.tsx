import { createClient } from '@/lib/supabase/server'
import SkillsView from '@/components/skills/SkillsView'

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

  return (
    <div className="relative z-10 min-h-screen px-6 pt-32 pb-20 max-w-7xl mx-auto">
      <div className="mb-10">
        <p
          className="font-mono uppercase text-xs mb-4"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
        >
          Skills Hub
        </p>
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
