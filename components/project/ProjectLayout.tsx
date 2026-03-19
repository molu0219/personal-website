'use client'

import Link from 'next/link'
import { ArrowLeft, ExternalLink, Github, Circle } from 'lucide-react'
import NeonBadge from '@/components/ui/NeonBadge'
import TableOfContents from '@/components/blog/TableOfContents'

interface Project {
  title: string
  description?: string
  content: string
  tags?: string[]
  cover_url?: string
  url?: string
  github_url?: string
  status?: string
}

export default function ProjectLayout({
  project,
  children,
}: {
  project: Project
  children: React.ReactNode
}) {
  const isLive = !project.status || project.status === 'live'

  return (
    <div className="relative z-10 min-h-screen pb-20">
      {/* Full-width cover image */}
      {project.cover_url && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={project.cover_url}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ transform: 'scale(1.03)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, color-mix(in srgb, var(--bg) 20%, transparent) 0%, var(--bg) 100%)',
            }}
          />
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-6 ${project.cover_url ? 'pt-4' : 'pt-28'}`}>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 items-start">
          {/* Main content */}
          <article>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags?.map(tag => (
                <NeonBadge key={tag} color="cyan">{tag}</NeonBadge>
              ))}
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {project.title}
            </h1>

            {project.description && (
              <p
                className="text-lg mb-8 pb-8"
                style={{
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                  lineHeight: '1.7',
                }}
              >
                {project.description}
              </p>
            )}

            <div className="prose-theme">{children}</div>
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
            <div
              className="rounded-2xl p-5 space-y-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Project Info
                </p>
                <div className="flex items-center gap-2">
                  <Circle
                    size={8}
                    fill={isLive ? 'var(--cyan)' : 'var(--text-muted)'}
                    style={{ color: isLive ? 'var(--cyan)' : 'var(--text-muted)' }}
                  />
                  <span className="text-sm" style={{ color: isLive ? 'var(--cyan)' : 'var(--text-muted)' }}>
                    {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Live'}
                  </span>
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map(tag => (
                      <NeonBadge key={tag} color="white">{tag}</NeonBadge>
                    ))}
                  </div>
                </div>
              )}

              {(project.url || project.github_url) && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Links
                  </p>
                  <div className="space-y-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                        style={{ color: 'var(--cyan)', cursor: 'none' }}
                      >
                        <ExternalLink size={14} />
                        Live Demo
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                        style={{ color: 'var(--text-secondary)', cursor: 'none' }}
                      >
                        <Github size={14} />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* TOC */}
              {project.content && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <TableOfContents content={project.content} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
