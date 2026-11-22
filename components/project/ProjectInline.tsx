import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import AsciiArt from '@/components/art/AsciiArt'
import TableOfContents from '@/components/blog/TableOfContents'
import { contentArt } from '@/lib/ascii/motifs'
import { MARKDOWN_COMPONENTS } from '@/components/blog/markdown'

export interface InlineProject {
  slug: string
  title: string
  description?: string | null
  content?: string | null
  tags?: string[] | null
  url?: string | null
  github_url?: string | null
  status?: string | null
}

const mono = { fontFamily: 'var(--font-mono)' } as const
const linkCls = 'underline underline-offset-4 decoration-[var(--border-strong)] hover:decoration-[var(--accent)] transition-colors'

/** A project's full write-up, rendered on the server and opened in place under the map. */
export default function ProjectInline({ project }: { project: InlineProject }) {
  const p = project
  return (
    <article>
      <header className="grid gap-8 border-b pb-10 md:grid-cols-[1fr_auto] md:items-end" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="mb-4 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
            ~/projects/{p.slug}
          </p>
          <h2 className="text-3xl md:text-5xl font-medium leading-[1.08] tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {p.title}
          </h2>
          {p.description && (
            <p className="mt-5 max-w-[62ch] text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {p.description}
            </p>
          )}
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm" style={mono}>
            {p.status && <span style={{ color: 'var(--text-muted)' }}>status: {p.status}</span>}
            {p.url && (
              <a href={p.url} target="_blank" rel="noopener noreferrer" className={linkCls} style={{ color: 'var(--text-primary)' }}>
                live ↗
              </a>
            )}
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noopener noreferrer" className={linkCls} style={{ color: 'var(--text-primary)' }}>
                github ↗
              </a>
            )}
            <Link href={`/projects/${p.slug}`} className={linkCls} style={{ color: 'var(--text-secondary)' }}>
              permalink →
            </Link>
          </p>
          {p.tags && p.tags.length > 0 && (
            <p className="mt-4 text-xs" style={{ ...mono, color: 'var(--text-muted)' }}>
              {p.tags.map(t => `#${t}`).join('  ')}
            </p>
          )}
        </div>
        <div className="ascii-dark overflow-hidden rounded-xl border" style={{ borderColor: '#232323', background: '#0a0a0a' }}>
          <AsciiArt grid={contentArt({ content: p.content ?? '', seed: p.slug, tags: p.tags }, 84, 28)} className="p-3 text-[5px] leading-[6.5px]" />
        </div>
      </header>
      {p.content && (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-between">
          <div className="prose-theme min-w-0">
            <ReactMarkdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings]}>
              {p.content}
            </ReactMarkdown>
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <TableOfContents content={p.content} />
            </div>
          </aside>
        </div>
      )}
    </article>
  )
}
