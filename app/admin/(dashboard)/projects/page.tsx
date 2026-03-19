'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import NeonBadge from '@/components/ui/NeonBadge'
import GlassInput from '@/components/ui/GlassInput'
import ImageUpload from '@/components/ui/ImageUpload'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import TagInput from '@/components/ui/TagInput'

interface Project {
  id: string
  slug: string
  title: string
  description: string
  content?: string
  cover_url?: string
  tags: string[]
  published: boolean
  featured: boolean
  url?: string
  github_url?: string
  created_at: string
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError('')
    const { error: err } = editing.id
      ? await supabase.from('projects').update({ ...editing, updated_at: new Date().toISOString() }).eq('id', editing.id)
      : await supabase.from('projects').insert({ ...editing })
    setSaving(false)
    if (err) {
      setSaveError(err.message)
    } else {
      setEditing(null)
      load()
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    load()
  }

  const toggle = async (id: string, field: 'published' | 'featured', val: boolean) => {
    await supabase.from('projects').update({ [field]: val }).eq('id', id)
    load()
  }

  if (editing !== null) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          {editing.id ? 'Edit Project' : 'New Project'}
        </h1>
        <GlassCard className="p-6 space-y-4">
          <GlassInput label="Title" value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full" />
          <GlassInput label="Slug" value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full" />
          <GlassInput label="Description" value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full" />
          <TagInput label="Tags (comma-separated)" value={editing.tags ?? []} onChange={tags => setEditing({ ...editing, tags })} className="w-full" />
          <GlassInput label="Live URL" value={editing.url ?? ''} onChange={e => setEditing({ ...editing, url: e.target.value })} className="w-full" />
          <GlassInput label="GitHub URL" value={editing.github_url ?? ''} onChange={e => setEditing({ ...editing, github_url: e.target.value })} className="w-full" />
          <ImageUpload
            label="Cover Image"
            value={(editing as any).cover_url ?? ''}
            onChange={url => setEditing({ ...editing, cover_url: url } as any)}
          />
          <MarkdownEditor
            label="Content (Markdown)"
            value={(editing as any).content ?? ''}
            onChange={v => setEditing({ ...editing, content: v } as any)}
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)', cursor: 'none' }}>
              <input type="checkbox" checked={editing.published ?? false} onChange={e => setEditing({ ...editing, published: e.target.checked })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)', cursor: 'none' }}>
              <input type="checkbox" checked={editing.featured ?? false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} />
              Featured
            </label>
          </div>
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <NeonButton variant="cyan" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</NeonButton>
            <NeonButton variant="ghost" onClick={() => setEditing(null)}>Cancel</NeonButton>
            {saveError && <span className="text-sm" style={{ color: 'var(--pink)' }}>{saveError}</span>}
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Projects</h1>
        <NeonButton variant="cyan" onClick={() => setEditing({})}>+ New Project</NeonButton>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <GlassCard key={project.id} className="flex items-center justify-between p-5 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{project.title}</span>
                  {project.published ? <NeonBadge color="cyan">Published</NeonBadge> : <NeonBadge color="white">Draft</NeonBadge>}
                  {project.featured && <NeonBadge color="purple">Featured</NeonBadge>}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.slug}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <NeonButton variant="ghost" onClick={() => toggle(project.id, 'published', !project.published)}>
                  {project.published ? 'Unpublish' : 'Publish'}
                </NeonButton>
                <NeonButton variant="cyan" onClick={() => setEditing(project)}>Edit</NeonButton>
                <NeonButton variant="pink" onClick={() => remove(project.id)}>Delete</NeonButton>
              </div>
            </GlassCard>
          ))}
          {projects.length === 0 && (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No projects yet. Create your first!</p>
          )}
        </div>
      )}
    </div>
  )
}
