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

export default function ProjectCard({ project, views }: { project: ProjectSummary; views?: number }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
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
            ./{project.slug}
          </div>
        )}
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
