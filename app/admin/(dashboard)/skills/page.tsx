'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import NeonBadge from '@/components/ui/NeonBadge'
import GlassInput from '@/components/ui/GlassInput'

interface Skill {
  id: string
  name: string
  description: string
  repo_url: string
  install_command: string
  claude_install_command: string
  stars: number
  forks: number
  published: boolean
  created_at: string
}

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Skill> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [githubUrl, setGithubUrl] = useState('')

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: false })
    setSkills(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const fetchGithub = async () => {
    if (!githubUrl.trim()) return
    setFetching(true)
    setSaveError('')
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
      if (!match) { setSaveError('Invalid GitHub URL'); setFetching(false); return }

      const owner = match[1]
      const repo = match[2].replace(/\.git$/, '')

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      })

      if (!res.ok) { setSaveError('Repository not found'); setFetching(false); return }

      const data = await res.json()
      setEditing(prev => ({
        ...prev,
        name: data.name ?? '',
        description: data.description ?? '',
        stars: data.stargazers_count ?? 0,
        forks: data.forks_count ?? 0,
        repo_url: data.html_url ?? githubUrl,
      }))
    } catch {
      setSaveError('Failed to fetch repo info')
    }
    setFetching(false)
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError('')
    const { error: err } = editing.id
      ? await supabase.from('skills').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
      : await supabase.from('skills').insert({ ...editing })
    setSaving(false)
    if (err) {
      setSaveError(err.message)
    } else {
      setEditing(null)
      setGithubUrl('')
      load()
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    await supabase.from('skills').delete().eq('id', id)
    load()
  }

  const toggle = async (id: string, val: boolean) => {
    await supabase.from('skills').update({ published: val }).eq('id', id)
    load()
  }

  const refreshStars = async () => {
    setRefreshing(true)
    try {
      for (const skill of skills) {
        const match = skill.repo_url?.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
        if (!match) continue
        const owner = match[1]
        const repo = match[2].replace(/\.git$/, '')
        try {
          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: { Accept: 'application/vnd.github.v3+json' },
          })
          if (!res.ok) continue
          const data = await res.json()
          await supabase.from('skills').update({
            stars: data.stargazers_count ?? 0,
            forks: data.forks_count ?? 0,
            updated_at: new Date().toISOString(),
          }).eq('id', skill.id)
        } catch {}
      }
      load()
    } finally {
      setRefreshing(false)
    }
  }

  if (editing !== null) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          {editing.id ? 'Edit Skill' : 'New Skill'}
        </h1>
        <GlassCard className="p-6 space-y-4">
          {/* GitHub URL fetch */}
          {!editing.id && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <GlassInput
                  label="GitHub Repository URL"
                  placeholder="https://github.com/user/repo"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="w-full"
                />
              </div>
              <NeonButton variant="cyan" onClick={fetchGithub} disabled={fetching}>
                {fetching ? 'Fetching…' : 'Fetch'}
              </NeonButton>
            </div>
          )}

          <GlassInput label="Name" value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full" />
          <GlassInput label="Description" value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full" />
          <GlassInput label="Repo URL" value={editing.repo_url ?? ''} onChange={e => setEditing({ ...editing, repo_url: e.target.value })} className="w-full" />

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Install Command (CLI)</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-20 font-mono"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="npx agent-skills-cli add user/repo"
              value={editing.install_command ?? ''}
              onChange={e => setEditing({ ...editing, install_command: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: 'var(--purple)' }}>Install Command (Claude Code CLI)</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-20 font-mono"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
              placeholder="/install github:user/repo"
              value={(editing as any).claude_install_command ?? ''}
              onChange={e => setEditing({ ...editing, claude_install_command: e.target.value } as any)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput label="Stars" type="number" value={editing.stars ?? 0} onChange={e => setEditing({ ...editing, stars: parseInt(e.target.value) || 0 })} className="w-full" />
            <GlassInput label="Forks" type="number" value={editing.forks ?? 0} onChange={e => setEditing({ ...editing, forks: parseInt(e.target.value) || 0 })} className="w-full" />
          </div>

          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={editing.published ?? false} onChange={e => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <NeonButton variant="cyan" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</NeonButton>
            <NeonButton variant="ghost" onClick={() => { setEditing(null); setGithubUrl('') }}>Cancel</NeonButton>
            {saveError && <span className="text-sm" style={{ color: 'var(--pink)' }}>{saveError}</span>}
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Skills</h1>
        <div className="flex items-center gap-2">
          <NeonButton variant="ghost" onClick={refreshStars} disabled={refreshing}>
            {refreshing ? 'Refreshing…' : 'Refresh Stars'}
          </NeonButton>
          <NeonButton variant="cyan" onClick={() => setEditing({})}>+ New Skill</NeonButton>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div className="space-y-3">
          {skills.map(skill => (
            <GlassCard key={skill.id} className="flex items-center justify-between p-5 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.name}</span>
                  {skill.published ? <NeonBadge color="cyan">Published</NeonBadge> : <NeonBadge color="white">Draft</NeonBadge>}
                  {skill.install_command && <NeonBadge color="cyan">CLI</NeonBadge>}
                  {skill.claude_install_command && <NeonBadge color="purple">Claude Code</NeonBadge>}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>⭐ {skill.stars} · 🍴 {skill.forks}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{skill.description}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <NeonButton variant="ghost" onClick={() => toggle(skill.id, !skill.published)}>
                  {skill.published ? 'Unpublish' : 'Publish'}
                </NeonButton>
                <NeonButton variant="cyan" onClick={() => setEditing(skill)}>Edit</NeonButton>
                <NeonButton variant="pink" onClick={() => remove(skill.id)}>Delete</NeonButton>
              </div>
            </GlassCard>
          ))}
          {skills.length === 0 && (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No skills yet. Create your first!</p>
          )}
        </div>
      )}
    </div>
  )
}
