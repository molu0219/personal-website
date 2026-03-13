'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'

interface Post {
  id: string
  slug: string
  title: string
  excerpt?: string
  tags?: string[]
  cover_url?: string
  published_at?: string
}

const TAG_GRADIENTS: Record<string, string> = {
  'Blockchain': '135deg, #0d1b4b, #0a3060',
  'DeFi':       '135deg, #0d3b1f, #063320',
  'NFT':        '135deg, #2d0a52, #1a0433',
  'AI':         '135deg, #4a0a2a, #300818',
  'Solidity':   '135deg, #0a1f50, #051235',
  'ZK Proofs':  '135deg, #1a0a50, #0d0530',
  'TypeScript': '135deg, #0a1f50, #051235',
  'Security':   '135deg, #500a0a, #300505',
}

type SortKey = 'newest' | 'oldest'

function coverBackground(tags?: string[]) {
  const key = tags?.[0] ?? ''
  const grad = TAG_GRADIENTS[key] ?? '135deg, #050520, #0a0a30'
  return `linear-gradient(${grad})`
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Search + Filter bar ─────────────────────────────────── */
function SearchBar({
  query, onQuery,
  sort, onSort,
  allTags, activeTag, onTag,
}: {
  query: string; onQuery: (v: string) => void
  sort: SortKey; onSort: (v: SortKey) => void
  allTags: string[]; activeTag: string; onTag: (v: string) => void
}) {
  return (
    <div className="space-y-3 mb-8">
      {/* Row 1: search + sort */}
      <div className="flex gap-3 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: 'var(--text-muted)' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search posts…"
            value={query}
            onChange={e => onQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--cyan) 50%, transparent)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
        </div>

        {/* Sort */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['newest', 'oldest'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => onSort(s)}
              className="px-4 py-2 text-xs font-medium transition-colors duration-150 capitalize"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: sort === s ? 'color-mix(in srgb, var(--cyan) 12%, transparent)' : 'transparent',
                color: sort === s ? 'var(--cyan)' : 'var(--text-muted)',
                borderRight: s === 'newest' ? '1px solid var(--border)' : 'none',
              }}
            >
              {s === 'newest' ? '↓ Newest' : '↑ Oldest'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {['All', ...allTags].map(tag => {
            const active = activeTag === tag
            return (
              <button
                key={tag}
                onClick={() => onTag(tag)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-150"
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  background: active ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'transparent',
                  border: `1px solid ${active ? 'color-mix(in srgb, var(--purple) 50%, transparent)' : 'var(--border)'}`,
                  color: active ? 'var(--purple)' : 'var(--text-muted)',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Cards ───────────────────────────────────────────────── */
function HeroCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <div
        className="relative overflow-hidden rounded-2xl transition-all duration-300"
        style={{ border: '1px solid var(--border)' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'color-mix(in srgb, var(--cyan) 50%, transparent)'
          el.style.boxShadow = '0 0 40px color-mix(in srgb, var(--cyan) 12%, transparent)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'none'
        }}
      >
        <div className="relative overflow-hidden" style={{ height: 340 }}>
          {post.cover_url ? (
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full relative" style={{ background: coverBackground(post.tags) }}>
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'linear-gradient(var(--cyan) 1px, transparent 1px), linear-gradient(90deg, var(--cyan) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />
            </div>
          )}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(0deg, rgba(5,5,16,0.92) 0%, rgba(5,5,16,0.3) 50%, transparent 100%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            {post.published_at && (
              <p className="text-xs font-mono mb-3" style={{ color: 'var(--cyan)', letterSpacing: '0.15em' }}>
                {formatDate(post.published_at)}
              </p>
            )}
            <h2
              className="font-bold leading-tight mb-3"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                color: '#fff',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
              }}
            >
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm line-clamp-2 mb-4" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '70ch' }}>
                {post.excerpt}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 4).map(tag => (
                <NeonBadge key={tag} color="cyan">{tag}</NeonBadge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/blog/${post.slug}`} className="block group h-full">
        <div
          className="h-full flex flex-col overflow-hidden rounded-xl transition-all duration-300"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'color-mix(in srgb, var(--purple) 50%, transparent)'
            el.style.boxShadow = '0 0 30px color-mix(in srgb, var(--purple) 10%, transparent)'
            el.style.transform = 'translateY(-3px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'var(--border)'
            el.style.boxShadow = 'none'
            el.style.transform = 'translateY(0)'
          }}
        >
          <div className="relative overflow-hidden flex-shrink-0" style={{ height: 180 }}>
            {post.cover_url ? (
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full relative" style={{ background: coverBackground(post.tags) }}>
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: 'linear-gradient(var(--purple) 1px, transparent 1px), linear-gradient(90deg, var(--purple) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />
              </div>
            )}
            <div
              className="absolute inset-x-0 bottom-0 h-12"
              style={{ background: 'linear-gradient(0deg, var(--surface), transparent)' }}
            />
          </div>
          <div className="flex flex-col flex-1 p-5">
            {post.published_at && (
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                {formatDate(post.published_at)}
              </p>
            )}
            <h3
              className="font-bold leading-snug mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.05rem', color: 'var(--text-primary)' }}
            >
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-xs line-clamp-2 mb-4 flex-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {post.excerpt}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {post.tags?.slice(0, 3).map(tag => (
                <NeonBadge key={tag} color="purple">{tag}</NeonBadge>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Main export ─────────────────────────────────────────── */
export default function BlogList({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [activeTag, setActiveTag] = useState('All')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach(p => p.tags?.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [posts])

  const filtered = useMemo(() => {
    let list = [...posts]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    if (activeTag !== 'All') {
      list = list.filter(p => p.tags?.includes(activeTag))
    }
    list.sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0
      return sort === 'newest' ? tb - ta : ta - tb
    })
    return list
  }, [posts, query, sort, activeTag])

  const isFiltering = query.trim() !== '' || activeTag !== 'All'
  const [hero, ...rest] = filtered

  return (
    <div>
      <SearchBar
        query={query} onQuery={setQuery}
        sort={sort} onSort={setSort}
        allTags={allTags} activeTag={activeTag} onTag={setActiveTag}
      />

      {filtered.length === 0 ? (
        <p className="text-center py-24 font-mono text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          No posts found.
        </p>
      ) : (
        <div className="space-y-8">
          {!isFiltering && hero ? (
            <>
              <motion.div
                key={hero.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <HeroCard post={hero} />
              </motion.div>
              {rest.length > 0 && (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {rest.map((post, i) => (
                      <PostCard key={post.id} post={post} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
