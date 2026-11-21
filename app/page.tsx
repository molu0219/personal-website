import { unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import SignalHero from '@/components/sections/SignalHero'
import type { Signal } from '@/lib/ascii/signal-field'
import ProjectCard, { type ProjectSummary } from '@/components/project/ProjectCard'
import PostRow, { type PostSummary } from '@/components/blog/PostRow'
import { createClient } from '@/lib/supabase/server'

interface AboutRow {
  name: string | null
  title: string | null
  hero_description: string | null
  status_text: string | null
  status_active: boolean | null
}

function SectionHeader({ index, title, href }: { index: string; title: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between border-b pb-4 mb-2" style={{ borderColor: 'var(--border)' }}>
      <h2 className="flex items-baseline gap-3 text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        <span className="text-xs font-normal" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {index}
        </span>
        {title}
      </h2>
      <Link
        href={href}
        className="text-sm transition-colors hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        View all →
      </Link>
    </div>
  )
}

export default async function HomePage() {
  let allProjects: (ProjectSummary & { featured?: boolean | null })[] = []
  let allPosts: PostSummary[] = []
  let about: AboutRow | null = null

  try {
    const supabase = await createClient()
    const [{ data: p }, { data: b }, { data: a }] = await Promise.all([
      supabase
        .from('projects')
        .select('id,slug,title,description,tags,featured')
        .eq('published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('posts')
        .select('id,slug,title,excerpt,tags,published_at')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      supabase.from('about').select('name,title,hero_description,status_text,status_active').single(),
    ])
    allProjects = p ?? []
    allPosts = b ?? []
    about = a
  } catch (err) {
    unstable_rethrow(err)
    // Render the static hero even if Supabase is unreachable.
    console.error('[home] failed to load content', err)
  }

  const posts = allPosts.slice(0, 5)
  const projects = allProjects.filter(p => p.featured).slice(0, 4)
  // Everything real the hero lens can decode: post and project paths.
  const signals: Signal[] = [
    ...allPosts.map(p => ({ label: `~/blog/${p.slug}`, title: p.title, href: `/blog/${p.slug}` })),
    ...allProjects.map(p => ({ label: `~/projects/${p.slug}`, title: p.title, href: `/projects/${p.slug}` })),
  ]

  return (
    <>
      <SignalHero
        name={about?.name ?? 'Joey Chen'}
        tagline={about?.title ?? 'Blockchain developer · AI agent workflows'}
        description={
          about?.hero_description ??
          'I build AI agent workflows and on-chain tools, and write about how they work.'
        }
        signals={signals}
        stats={{
          posts: allPosts.length,
          projects: allProjects.length,
          lastWrite: allPosts[0]?.published_at?.slice(0, 10) ?? null,
        }}
      />

      {posts.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <SectionHeader index="01" title="Writing" href="/blog" />
            <ul>
              {posts.map(post => <PostRow key={post.id} post={post} />)}
            </ul>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <SectionHeader index="02" title="Selected work" href="/projects" />
            <div className="grid gap-6 pt-6 sm:grid-cols-2">
              {projects.map(project => <ProjectCard key={project.id} project={project} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
