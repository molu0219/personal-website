import { createClient } from '@/lib/supabase/server'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'

export default async function AdminDashboard() {
  let stats = { projects: 0, posts: 0, publishedProjects: 0, publishedPosts: 0 }

  try {
    const supabase = await createClient()
    const [{ count: pc }, { count: bc }, { count: ppc }, { count: pbc }] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
    ])
    stats = { projects: pc ?? 0, posts: bc ?? 0, publishedProjects: ppc ?? 0, publishedPosts: pbc ?? 0 }
  } catch {}

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Projects', value: stats.projects, color: 'var(--cyan)' },
          { label: 'Published Projects', value: stats.publishedProjects, color: 'var(--cyan)' },
          { label: 'Total Posts', value: stats.posts, color: 'var(--purple)' },
          { label: 'Published Posts', value: stats.publishedPosts, color: 'var(--purple)' },
        ].map(stat => (
          <GlassCard key={stat.label} className="p-6 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: 'Space Grotesk, sans-serif' }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--cyan)' }}>Projects</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Manage your portfolio projects</p>
          <NeonButton href="/admin/projects" variant="cyan">Manage →</NeonButton>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--purple)' }}>Blog Posts</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Write and publish articles</p>
          <NeonButton href="/admin/posts" variant="purple">Manage →</NeonButton>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-3" style={{ color: 'var(--pink)' }}>About</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Update your bio and skills</p>
          <NeonButton href="/admin/about" variant="pink">Edit →</NeonButton>
        </GlassCard>
      </div>
    </div>
  )
}
