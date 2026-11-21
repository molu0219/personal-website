import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'

export interface ProjectSummary {
  id: string
  slug: string
  title: string
  description?: string | null
  tags?: string[] | null
  cover_url?: string | null
  featured?: boolean | null
  created_at?: string | null
}

export default function ProjectCard({
  project,
  views,
  art,
}: {
  project: ProjectSummary
  views?: number
  /** Server-rendered fingerprint of the project write-up. */
  art?: React.ReactNode
}) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div
        className="aspect-[16/10] overflow-hidden rounded-lg border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
      >
        <div className="relative h-full overflow-hidden px-4 pt-4">
          {art}
          <span
            className="absolute bottom-3 left-3 text-xs"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
          >
            ./{project.slug}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-medium transition-colors group-hover:text-[var(--accent)]" style={{ color: 'var(--text-primary)' }}>
          {project.title}
        </h3>
        {views != null && views > 0 && (
          <span className="shrink-0 text-xs tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {views.toLocaleString()} views
          </span>
        )}
      </div>
      {project.description && (
        <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {project.description}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags?.slice(0, 3).map(tag => <NeonBadge key={tag}>{tag}</NeonBadge>)}
      </div>
    </Link>
  )
}
