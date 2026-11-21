import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'
import TableOfContents from '@/components/blog/TableOfContents'
import AsciiBanner from '@/components/art/AsciiBanner'
import { PROJECT_KNOT } from '@/lib/ascii-knot'

interface Project {
  slug: string
  title: string
  description?: string | null
  content: string
  tags?: string[] | null
  cover_url?: string | null
  url?: string | null
  github_url?: string | null
  status?: string | null
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs mb-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {label}
      </dt>
      <dd className="text-sm" style={{ color: 'var(--text-primary)' }}>{children}</dd>
    </div>
  )
}

const linkCls = 'underline underline-offset-4 decoration-[var(--border-strong)] hover:decoration-[var(--accent)] transition-colors'

export default function ProjectLayout({
  project,
  children,
  views,
}: {
  project: Project
  children: React.ReactNode
  views?: number
}) {
  const status = project.status || 'live'
  const isLive = status === 'live'

  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-16">
        <article className="min-w-0">
          <Link
            href="/projects"
            className="inline-block mb-10 text-xs transition-colors hover:text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            ← ~/projects
          </Link>

          <h1
            className="text-3xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.03em]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>
          )}

          <dl className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y" style={{ borderColor: 'var(--border)' }}>
            <MetaItem label="Status">
              <span className="inline-flex items-center gap-2 capitalize">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isLive ? 'var(--accent)' : 'var(--text-muted)' }}
                />
                {status}
              </span>
            </MetaItem>
            {(project.url || project.github_url) && (
              <MetaItem label="Links">
                <span className="flex flex-col gap-1">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      Live ↗
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      GitHub ↗
                    </a>
                  )}
                </span>
              </MetaItem>
            )}
            {views != null && views > 0 && (
              <MetaItem label="Views">
                <span className="tabular-nums">{views.toLocaleString()}</span>
              </MetaItem>
            )}
            {project.tags && project.tags.length > 0 && (
              <div className="col-span-2 sm:col-span-4">
                <dt className="sr-only">Stack</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {project.tags.map(tag => <NeonBadge key={tag}>{tag}</NeonBadge>)}
                </dd>
              </div>
            )}
          </dl>

          <AsciiBanner seed={project.slug} shape={PROJECT_KNOT} className="mt-10" />

          <div className="prose-theme mt-10 max-w-[68ch]">{children}</div>
        </article>

        {project.content && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents content={project.content} />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
