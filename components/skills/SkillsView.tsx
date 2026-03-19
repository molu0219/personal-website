'use client'

import { useState } from 'react'

type InstallMethod = 'cli' | 'claude-code'
type OutputMode = 'terminal' | 'script' | 'claude-code'

interface Skill {
  id: string
  name: string
  description: string
  repo_url: string
  install_command: string
  claude_install_command: string
  stars: number
  forks: number
}

function getMethodsForSkill(s: Skill): InstallMethod[] {
  const m: InstallMethod[] = []
  if (s.install_command) m.push('cli')
  if (s.claude_install_command) m.push('claude-code')
  return m
}

const METHOD_LABEL: Record<InstallMethod, string> = { cli: 'CLI', 'claude-code': 'Claude Code' }
const METHOD_COLOR: Record<InstallMethod, string> = { cli: 'var(--cyan)', 'claude-code': 'var(--purple)' }

export default function SkillsView({ skills }: { skills: Skill[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<OutputMode>('terminal')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [filter, setFilter] = useState<InstallMethod>('cli')

  const toggleSkill = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Filter: CLI shows skills with install_command, Claude Code shows skills with claude_install_command
  const filteredSkills = skills.filter(s =>
    filter === 'cli' ? !!s.install_command : !!s.claude_install_command
  )

  const sortedSkills = [...filteredSkills].sort((a, b) =>
    sortDir === 'desc' ? b.stars - a.stars : a.stars - b.stars
  )

  const toggleAll = () => {
    if (sortedSkills.length > 0 && sortedSkills.every(s => selected.has(s.id))) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sortedSkills.map(s => s.id)))
    }
  }

  const toggleSort = () => setSortDir(d => d === 'desc' ? 'asc' : 'desc')

  const selectedSkills = sortedSkills.filter(s => selected.has(s.id))

  // Commands always use the current filter's command type
  const commands = selectedSkills.map(s =>
    filter === 'claude-code' ? s.claude_install_command : s.install_command
  ).filter(Boolean)

  // For Claude Code filter, only claude-code tab; for CLI filter, terminal/script tabs
  const effectiveMode = filter === 'claude-code' ? 'claude-code' as const : mode

  const rawScript = commands.join('\n')

  const scriptOutput = rawScript
    ? `#!/bin/bash\n# Install ${commands.length} selected AI skill${commands.length > 1 ? 's' : ''}\n\n${rawScript}`
    : ''

  const copyScript = async () => {
    if (!rawScript) return
    const copyText = effectiveMode === 'script' ? scriptOutput : rawScript
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filter counts
  const cliCount = skills.filter(s => s.install_command).length
  const claudeCount = skills.filter(s => s.claude_install_command).length

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Table */}
      <div className="flex-1 min-w-0">
        {/* Filter bar */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'cli' as const, label: `CLI (${cliCount})`, color: 'var(--cyan)' },
            { key: 'claude-code' as const, label: `Claude Code (${claudeCount})`, color: 'var(--purple)' },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setSelected(new Set()) }}
              className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: filter === f.key ? 'var(--bg)' : 'var(--text-secondary)',
                background: filter === f.key ? f.color : 'var(--surface)',
                border: `1px solid ${filter === f.key ? f.color : 'var(--border)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          {/* Table header */}
          <div
            className="grid items-center gap-4 px-4 py-3 text-xs font-semibold uppercase"
            style={{
              gridTemplateColumns: '32px 1fr 2fr 70px 70px 40px',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              borderBottom: '1px solid var(--border)',
              background: 'color-mix(in srgb, var(--surface) 80%, var(--bg))',
            }}
          >
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={sortedSkills.length > 0 && sortedSkills.every(s => selected.has(s.id))}
                onChange={toggleAll}
                style={{ accentColor: 'var(--cyan)' }}
              />
            </div>
            <div>Name</div>
            <div className="hidden md:block">Description</div>
            <div
              className="text-right"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={toggleSort}
            >
              Stars {sortDir === 'desc' ? '↓' : '↑'}
            </div>
            <div className="text-right">Forks</div>
            <div />
          </div>

          {/* Table rows */}
          {sortedSkills.length === 0 ? (
            <div className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
              No skills available yet.
            </div>
          ) : (
            sortedSkills.map(skill => {
              const methods = getMethodsForSkill(skill)
              return (
                <div
                  key={skill.id}
                  className="grid items-center gap-4 px-4 py-3 transition-colors"
                  style={{
                    gridTemplateColumns: '32px 1fr 2fr 70px 70px 40px',
                    borderBottom: '1px solid var(--border)',
                    background: selected.has(skill.id)
                      ? 'color-mix(in srgb, var(--cyan) 5%, var(--surface))'
                      : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleSkill(skill.id)}
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selected.has(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ accentColor: 'var(--cyan)' }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: 'var(--cyan)' }}
                    >
                      {skill.name}
                    </span>
                    {methods.map(m => (
                      <span
                        key={m}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          color: METHOD_COLOR[m],
                          background: `color-mix(in srgb, ${METHOD_COLOR[m]} 10%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${METHOD_COLOR[m]} 25%, transparent)`,
                          fontSize: 10,
                          lineHeight: 1,
                        }}
                      >
                        {METHOD_LABEL[m]}
                      </span>
                    ))}
                  </div>
                  <div
                    className="text-sm truncate hidden md:block"
                    style={{ color: 'var(--text-secondary)' }}
                    title={skill.description}
                  >
                    {skill.description}
                  </div>
                  <div
                    className="text-sm text-right font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {skill.stars.toLocaleString()}
                  </div>
                  <div
                    className="text-sm text-right font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {skill.forks.toLocaleString()}
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={skill.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--cyan)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      title="View on GitHub"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </a>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Mobile: selected count */}
        {selected.size > 0 && (
          <div className="lg:hidden mt-4">
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Right: CRT Script Panel */}
      <div className="lg:w-96 lg:sticky lg:top-24 lg:self-start">
        <div
          style={{
            borderRadius: 14,
            border: '2px solid rgba(0, 255, 136, 0.3)',
            background: 'rgba(0, 10, 5, 0.92)',
            boxShadow: `
              0 0 20px rgba(0, 255, 136, 0.08),
              0 0 60px rgba(0, 255, 136, 0.04),
              inset 0 0 30px rgba(0, 255, 136, 0.03)
            `,
            overflow: 'hidden',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderBottom: '1px solid rgba(0, 255, 136, 0.15)',
              background: 'rgba(0, 255, 136, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
              {/* Mode tabs - driven by filter */}
              {(filter === 'claude-code'
                ? ['claude-code'] as OutputMode[]
                : ['terminal', 'script'] as OutputMode[]
              ).map((m, i) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    fontFamily: '"Courier New", Courier, monospace',
                    fontSize: 11,
                    color: effectiveMode === m ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 255, 136, 0.35)',
                    background: effectiveMode === m ? 'rgba(0, 255, 136, 0.1)' : 'none',
                    border: effectiveMode === m ? '1px solid rgba(0, 255, 136, 0.25)' : '1px solid transparent',
                    borderRadius: 3,
                    padding: '1px 8px',
                    cursor: 'pointer',
                    marginLeft: i === 0 ? 6 : 0,
                    letterSpacing: '0.05em',
                    lineHeight: 1.4,
                  }}
                >
                  {m === 'terminal' ? '> terminal' : m === 'script' ? '.sh script' : 'claude code'}
                </button>
              ))}
            </div>
            {rawScript && (
              <button
                onClick={copyScript}
                style={{
                  background: 'none',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: 3,
                  color: copied ? '#28c840' : 'rgba(0, 255, 136, 0.7)',
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: 11,
                  padding: '1px 8px',
                  cursor: 'pointer',
                  lineHeight: 1.4,
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {/* Content area */}
          <div style={{ position: 'relative', minHeight: 200 }}>
            {/* Scanline overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 136, 0.015) 2px,
                  rgba(0, 255, 136, 0.015) 4px
                )`,
                zIndex: 1,
              }}
            />

            {/* Glow overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.03) 0%, transparent 70%)',
                zIndex: 1,
              }}
            />

            {/* Script content */}
            <pre
              className="overflow-x-auto"
              style={{
                position: 'relative',
                zIndex: 0,
                padding: '12px 14px',
                margin: 0,
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 12,
                lineHeight: 1.8,
                color: 'rgba(0, 255, 136, 0.85)',
                minHeight: 200,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {rawScript ? (
                effectiveMode === 'script' ? (
                  <>
                    <span style={{ color: 'rgba(0, 255, 136, 0.4)' }}>#!/bin/bash</span>
                    {'\n'}
                    <span style={{ color: 'rgba(0, 255, 136, 0.4)' }}># Install {commands.length} selected AI skill{commands.length > 1 ? 's' : ''}</span>
                    {'\n\n'}
                    {rawScript}
                  </>
                ) : effectiveMode === 'claude-code' ? (
                  <>
                    <span style={{ color: 'rgba(0, 255, 136, 0.4)' }}># Run in Claude Code CLI</span>
                    {'\n\n'}
                    {commands.map((cmd, i) => (
                      <span key={i}>
                        {cmd}
                        {'\n'}
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    {commands.map((cmd, i) => (
                      <span key={i}>
                        <span style={{ color: 'rgba(0, 255, 136, 0.5)' }}>$ </span>
                        {cmd}
                        {'\n'}
                      </span>
                    ))}
                  </>
                )
              ) : (
                <span style={{ color: 'rgba(0, 255, 136, 0.3)' }}>
                  {'> select skills from the list to\n> generate install script...\n>\n> _'}
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
