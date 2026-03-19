'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import NeonBadge from '@/components/ui/NeonBadge'
import TableOfContents from './TableOfContents'

interface Post {
  title: string
  excerpt?: string
  content: string
  published_at?: string
  tags?: string[]
  cover_url?: string
}

function readingTime(content: string): number {
  return Math.ceil(content.trim().split(/\s+/).length / 200)
}

export default function ArticleLayout({
  post,
  children,
  views,
}: {
  post: Post
  children: React.ReactNode
  views?: number
}) {
  const minutes = readingTime(post.content)

  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12 items-start">
          {/* Main article */}
          <article>
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {post.tags?.map(tag => (
                <NeonBadge key={tag} color="purple">{tag}</NeonBadge>
              ))}
            </div>
            <div
              className="flex flex-wrap gap-3 text-sm mb-6"
              style={{ color: 'var(--text-muted)' }}
            >
              {post.published_at && (
                <span>
                  {new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span>·</span>
              <span>{minutes} min read</span>
              {views != null && views > 0 && (
                <>
                  <span>·</span>
                  <span>{views.toLocaleString()} views</span>
                </>
              )}
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="text-lg mb-8 pb-8"
                style={{
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border)',
                  lineHeight: '1.7',
                }}
              >
                {post.excerpt}
              </p>
            )}

            {post.cover_url && (
              <div
                className="mb-10 rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                <img src={post.cover_url} alt={post.title} className="w-full" />
              </div>
            )}

            <div className="prose-theme">{children}</div>
          </article>

          {/* Sticky sidebar */}
          <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
            <TableOfContents content={post.content} />
          </aside>
        </div>
      </div>
    </div>
  )
}
