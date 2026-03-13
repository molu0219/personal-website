import AuroraCanvas from '@/components/art/AuroraCanvas'
import HeroSection from '@/components/sections/HeroSection'
import { createClient } from '@/lib/supabase/server'
import NeonButton from '@/components/ui/NeonButton'
import NeonBadge from '@/components/ui/NeonBadge'
import ScrollCarousel from '@/components/ui/ScrollCarousel'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  'Solidity':   '20,80,180',
  'DeFi':       '0,160,100',
  'NFT':        '120,0,200',
  'AI':         '200,40,100',
  'ZK Proofs':  '80,0,200',
  'TypeScript': '0,100,200',
  'Ethereum':   '80,60,200',
  'Solana':     '100,200,80',
  'Security':   '200,0,60',
}

function tagGradient(tags: string[]) {
  const rgb = TAG_COLORS[tags?.[0]] ?? '0,100,160'
  return `linear-gradient(135deg, rgba(${rgb},0.3) 0%, rgba(${rgb},0.05) 100%)`
}

export default async function HomePage() {
  let projects: any[] = []
  let posts: any[] = []

  try {
    const supabase = await createClient()
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase
        .from('projects')
        .select('id,slug,title,description,tags,cover_url,featured')
        .eq('published', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('posts')
        .select('id,slug,title,excerpt,tags,cover_url,published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(5),
    ])
    projects = p ?? []
    posts = b ?? []
  } catch {}

  return (
    <>
      <AuroraCanvas />
      <HeroSection />

      {/* Recent Posts */}
      {posts.length > 0 && (
        <section className="relative z-10 pt-20 pb-10">
          <div className="flex items-center justify-between mb-8 px-6 max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              Recent <span className="gradient-text">Posts</span>
            </h2>
            <NeonButton href="/blog" variant="ghost">View All →</NeonButton>
          </div>
          <div className="pl-6 max-w-6xl mx-auto">
            <ScrollCarousel>
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="flex-shrink-0"
                  style={{ width: 280, scrollSnapAlign: 'start' }}
                >
                  <div className="card-hover-purple h-full rounded-xl overflow-hidden group">
                    {/* Cover */}
                    <div className="overflow-hidden" style={{ height: 160 }}>
                      {post.cover_url ? (
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: tagGradient(post.tags) }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      {post.published_at && (
                        <p className="text-xs mb-2 font-mono" style={{ color: 'var(--text-muted)' }}>
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      )}
                      <h3
                        className="font-semibold text-sm leading-snug mb-2 line-clamp-2"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags?.slice(0, 2).map((tag: string) => (
                          <NeonBadge key={tag} color="purple">{tag}</NeonBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </ScrollCarousel>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="relative z-10 pt-10 pb-20">
          <div className="flex items-center justify-between mb-8 px-6 max-w-6xl mx-auto">
            <h2
              className="text-3xl font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              Featured <span className="gradient-text">Projects</span>
            </h2>
            <NeonButton href="/projects" variant="ghost">View All →</NeonButton>
          </div>
          <div className="pl-6 max-w-6xl mx-auto">
            <ScrollCarousel>
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="flex-shrink-0"
                  style={{ width: 300, scrollSnapAlign: 'start' }}
                >
                  <div className="card-hover-cyan h-full rounded-xl overflow-hidden group">
                    {/* Cover */}
                    <div className="overflow-hidden" style={{ height: 180 }}>
                      {project.cover_url ? (
                        <img
                          src={project.cover_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: tagGradient(project.tags) }}
                        />
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4">
                      <h3
                        className="font-semibold text-sm mb-2 line-clamp-2"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {project.title}
                      </h3>
                      <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags?.slice(0, 3).map((tag: string) => (
                          <NeonBadge key={tag} color="cyan">{tag}</NeonBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </ScrollCarousel>
          </div>
        </section>
      )}
    </>
  )
}
