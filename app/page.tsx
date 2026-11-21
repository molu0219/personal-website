import Link from 'next/link'
import HeroSection from '@/components/sections/HeroSection'
import NeonBadge from '@/components/ui/NeonBadge'
import PostRow, { type PostSummary } from '@/components/blog/PostRow'
import { createClient } from '@/lib/supabase/server'

interface ProjectRow {
  id: string
  slug: string
  title: string
  description: string | null
  tags: string[] | null
  cover_url: string | null
}

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
  let projects: ProjectRow[] = []
  let posts: PostSummary[] = []
  let about: AboutRow | null = null

  try {
    const supabase = await createClient()
    const [{ data: p }, { data: b }, { data: a }] = await Promise.all([
      supabase
        .from('projects')
        .select('id,slug,title,description,tags,cover_url')
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
              {projects.map(project => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                  <div
                    className="aspect-[16/10] overflow-hidden rounded-lg border"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                  >
                    {project.cover_url ? (
                      <img
                        src={project.cover_url}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center text-xs"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
                      >
                        {project.slug}
                      </div>
                    )}
                  </div>
                  <h3
                    className="mt-4 font-medium transition-colors group-hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tags?.slice(0, 3).map(tag => <NeonBadge key={tag}>{tag}</NeonBadge>)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
