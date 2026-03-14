'use client'

import { useState } from 'react'
import GlassCard from '@/components/ui/GlassCard'

type PageRow = { path: string; count: number; label: string }

interface Props {
  all: PageRow[]
  blogs: PageRow[]
  projects: PageRow[]
}

export default function ContentTabs({ all, blogs, projects }: Props) {
  const [tab, setTab] = useState<'all' | 'blogs' | 'projects'>('all')

  const tabs = [
    { key: 'all' as const, label: 'All Pages', data: all },
    { key: 'blogs' as const, label: 'Blog Posts', data: blogs },
    { key: 'projects' as const, label: 'Projects', data: projects },
  ]

  const current = tabs.find(t => t.key === tab)!
  const max = Math.max(...current.data.map(r => r.count), 1)
  const total = current.data.reduce((s, r) => s + r.count, 0)

  return (
    <GlassCard className="p-6">
      {/* Tab header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          CONTENT PERFORMANCE (30d)
        </h2>
        <div className="flex gap-1" style={{ background: 'var(--bg)', borderRadius: 8, padding: 3 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1 text-xs rounded-md transition-all"
              style={{
                background: tab === t.key ? 'var(--surface)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-muted)',
                border: tab === t.key ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              {t.label}
              <span className="ml-1.5 opacity-60">({t.data.length})</span>
            </button>
          ))}
        </div>
      </div>

      {current.data.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No data yet</p>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="flex text-xs mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
            <span className="flex-1">Page</span>
            <span className="w-16 text-right">Views</span>
            <span className="w-16 text-right">% Share</span>
          </div>
          {current.data.map(({ path, count, label }) => (
            <div key={path} className="group">
              <div className="flex items-center gap-3 px-1 py-1.5 rounded-md transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{label || path}</div>
                  <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{path}</div>
                  <div className="mt-1 h-0.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-0.5 rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%`, background: 'var(--cyan)' }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm font-mono font-semibold" style={{ color: 'var(--cyan)' }}>
                  {count.toLocaleString()}
                </div>
                <div className="w-16 text-right text-xs" style={{ color: 'var(--text-muted)' }}>
                  {total > 0 ? ((count / total) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
