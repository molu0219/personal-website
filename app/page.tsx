import { unstable_rethrow } from 'next/navigation'
import Link from 'next/link'
import HeroSection from '@/components/sections/HeroSection'
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
  let projects: ProjectSummary[] = []
  let posts: PostSummary[] = []
  let about: AboutRow | null = null

  try {
    const supabase = await createClient()
    const [{ data: p }, { data: b }, { data: a }] = await Promise.all([
      supabase
        .from('projects')
        .select('id,slug,title,description,tags')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('posts')
        .select('id,slug,title,excerpt,tags,published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5),
      supabase.from('about').select('name,title,hero_description,status_text,status_active').single(),
    ])
    projects = p ?? []
    posts = b ?? []
    about = a
  } catch (err) {
    unstable_rethrow(err)
    // Render the static hero even if Supabase is unreachable.
    console.error('[home] failed to load content', err)
  }

  return (
    <>
      <HeroSection
        name={about?.name ?? undefined}
        tagline={about?.title ?? undefined}
        description={about?.hero_description ?? undefined}
        statusText={about?.status_text ?? undefined}
        statusActive={about?.status_active ?? true}
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
