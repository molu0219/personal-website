import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProjectGrid from '@/components/sections/ProjectGrid'

export const metadata: Metadata = {
  title: 'Projects — Joey Chen',
  description: 'Blockchain, AI, and Web3 projects by Joey Chen.',
}

export default async function ProjectsPage() {
  let projects: any[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    projects = data ?? []
  } catch {}

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="px-8 pt-32 pb-12 max-w-6xl mx-auto">
        <p
          className="font-mono uppercase text-xs mb-4"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
        >
          Portfolio
        </p>
        <h1
          className="font-bold uppercase mb-6"
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            color: 'var(--text-primary)',
            letterSpacing: '0.18em',
            lineHeight: 1,
          }}
        >
          Projects
        </h1>
        <p
          className="font-mono text-xs uppercase"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.2em' }}
        >
          Blockchain · AI · Web3 · Open Source
        </p>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} />

      <div className="px-8 py-16 max-w-6xl mx-auto">
        <ProjectGrid projects={projects} />
      </div>
    </div>
  )
}
