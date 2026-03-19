'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import NeonBadge from '@/components/ui/NeonBadge'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  cover_url?: string
  url?: string
  github_url?: string
  featured: boolean
  created_at: string
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Blockchain': ['Solidity', 'Ethereum', 'EVM', 'Foundry', 'Hardhat', 'Cairo', 'Move', 'Anchor', 'Solana', 'Web3', 'Web3.js', 'Ethers.js'],
  'DeFi':       ['DeFi', 'AMM', 'Lending', 'Yield', 'Bridge', 'Staking', 'Liquidity'],
  'NFT':        ['NFT', 'ERC-721', 'ERC-1155', 'Metadata', 'Marketplace'],
  'AI':         ['AI', 'ML', 'LLM', 'GPT', 'Generative'],
  'ZK':         ['ZK Proofs', 'ZK', 'zkEVM', 'Circom', 'SNARK', 'STARK', 'Privacy'],
  'Security':   ['Security', 'Audit', 'Pentest', 'CTF'],
  'Tooling':    ['TypeScript', 'Rust', 'Python', 'Go', 'CLI', 'SDK', 'API', 'Analytics'],
}

const CATEGORY_COLORS: Record<string, 'cyan' | 'purple' | 'pink'> = {
  'Blockchain': 'cyan',
  'DeFi':       'cyan',
  'NFT':        'purple',
  'AI':         'pink',
  'ZK':         'purple',
  'Security':   'pink',
  'Tooling':    'cyan',
  'Other':      'cyan',
}

const COVER_GRADIENTS: Record<string, string> = {
  'Blockchain': '135deg, #030d2e 0%, #050e1a 100%',
  'DeFi':       '135deg, #031a0d 0%, #040f08 100%',
  'NFT':        '135deg, #170830 0%, #0d0518 100%',
  'AI':         '135deg, #2a0515 0%, #180410 100%',
  'ZK':         '135deg, #0a0330 0%, #060118 100%',
  'Security':   '135deg, #2a0505 0%, #150303 100%',
  'Tooling':    '135deg, #030e2a 0%, #020a18 100%',
  'Other':      '135deg, #050520 0%, #030312 100%',
}

function detectCategory(tags: string[]): string {
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (tags?.some(t => keywords.some(k => k.toLowerCase() === t.toLowerCase()))) return cat
  }
  return 'Other'
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const category = detectCategory(project.tags)
  const color = CATEGORY_COLORS[category]
  const grad = COVER_GRADIENTS[category]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="group h-full flex flex-col overflow-hidden rounded-xl transition-all duration-300 no-underline"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = `color-mix(in srgb, var(--${color}) 50%, transparent)`
          el.style.boxShadow = `0 0 30px color-mix(in srgb, var(--${color}) 10%, transparent)`
          el.style.transform = 'translateY(-4px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--border)'
          el.style.boxShadow = 'none'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Cover */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: 160 }}>
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full relative flex items-center justify-center"
              style={{ background: `linear-gradient(${grad})` }}
            >
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: `linear-gradient(var(--${color}) 1px, transparent 1px), linear-gradient(90deg, var(--${color}) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
              />
              <span
                className="relative font-bold uppercase text-xs tracking-widest"
                style={{ color: `color-mix(in srgb, var(--${color}) 50%, transparent)`, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.3em' }}
              >
                {category}
              </span>
            </div>
          )}
          {/* Category chip */}
          <div className="absolute top-3 left-3">
            <NeonBadge color={color}>{category}</NeonBadge>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(e.currentTarget.href, '_blank') }}
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                title="GitHub"
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(0,0,0,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)' }}
              >
                <GitHubIcon />
              </a>
            )}
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => { e.stopPropagation(); e.preventDefault(); window.open(e.currentTarget.href, '_blank') }}
                className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--text-muted)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                title="Live Demo"
                onMouseEnter={e => { e.currentTarget.style.color = `var(--${color})`; e.currentTarget.style.background = 'rgba(0,0,0,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)' }}
              >
                <ExternalIcon />
              </a>
            )}
            {project.featured && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--cyan) 15%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--cyan) 40%, transparent)',
                  color: 'var(--cyan)',
                  letterSpacing: '0.1em',
                }}
              >
                ★
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          <h3
            className="font-bold leading-snug mb-2"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            {project.title}
          </h3>
          <p
            className="text-xs line-clamp-2 mb-4 flex-1"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-xs font-mono"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

type SortKey = 'newest' | 'oldest' | 'featured'

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [activeTag, setActiveTag] = useState('All')

  // Collect all unique tags from projects
  const allTags = useMemo(
    () => ['All', ...Array.from(new Set(projects.flatMap(p => p.tags ?? [])))],
    [projects]
  )

  const filtered = useMemo(() => {
    let list = [...projects]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    if (activeTag !== 'All') {
      list = list.filter(p => p.tags?.some(t => t === activeTag))
    }
    list.sort((a, b) => {
      if (sort === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return sort === 'newest' ? tb - ta : ta - tb
    })
    return list
  }, [projects, query, sort, activeTag])

  if (projects.length === 0) {
    return (
      <p className="text-center py-32 font-mono uppercase tracking-widest text-sm" style={{ color: 'var(--text-muted)' }}>
        No projects yet
      </p>
    )
  }

  return (
    <div>
      {/* ── Search + Sort row ── */}
      <div className="flex gap-3 flex-wrap mb-5">
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
            placeholder="Search projects…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--cyan) 50%, transparent)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
        </div>

        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['newest', 'oldest', 'featured'] as SortKey[]).map((s, i, arr) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-4 py-2 text-xs font-medium transition-colors duration-150 capitalize"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: sort === s ? 'color-mix(in srgb, var(--cyan) 12%, transparent)' : 'transparent',
                color: sort === s ? 'var(--cyan)' : 'var(--text-muted)',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              {s === 'newest' ? '↓ Newest' : s === 'oldest' ? '↑ Oldest' : '★ Featured'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tag filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {allTags.map(tag => {
          const isActive = activeTag === tag
          return (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                letterSpacing: '0.08em',
                background: isActive ? 'color-mix(in srgb, var(--cyan) 15%, transparent)' : 'transparent',
                border: `1px solid ${isActive ? 'color-mix(in srgb, var(--cyan) 50%, transparent)' : 'var(--border)'}`,
                color: isActive ? 'var(--cyan)' : 'var(--text-muted)',
              }}
            >
              {tag}
              <span className="ml-1.5 opacity-60" style={{ fontFamily: 'Inter, sans-serif' }}>
                {tag === 'All'
                  ? projects.length
                  : projects.filter(p => p.tags?.includes(tag)).length}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="text-center py-24 font-mono text-sm uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          No projects found.
        </p>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
