'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import NeonBadge from '@/components/ui/NeonBadge'
import GlassInput from '@/components/ui/GlassInput'
import ImageUpload from '@/components/ui/ImageUpload'
import MarkdownEditor from '@/components/ui/MarkdownEditor'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  tags: string[]
  published: boolean
  published_at?: string
  created_at: string
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Post> | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError('')
    const payload: any = { ...editing, updated_at: new Date().toISOString() }
    if (payload.published && !payload.published_at) {
      payload.published_at = new Date().toISOString()
    }
    const { error: err } = editing.id
      ? await supabase.from('posts').update(payload).eq('id', editing.id)
      : await supabase.from('posts').insert(payload)
    setSaving(false)
    if (err) {
      setSaveError(err.message)
    } else {
      setEditing(null)
      load()
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('posts').delete().eq('id', id)
    load()
  }

  if (editing !== null) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          {editing.id ? 'Edit Post' : 'New Post'}
        </h1>
        <GlassCard className="p-6 space-y-4">
          <GlassInput label="Title" value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full" />
          <GlassInput label="Slug" value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full" />
          <GlassInput label="Excerpt" value={editing.excerpt ?? ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} className="w-full" />
          <GlassInput label="Tags (comma-separated)" value={editing.tags?.join(', ') ?? ''} onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className="w-full" />
          <ImageUpload
            label="Cover Image"
            value={(editing as any).cover_url ?? ''}
            onChange={url => setEditing({ ...editing, cover_url: url } as any)}
          />
          <MarkdownEditor
            label="Content (Markdown)"
            value={editing.content ?? ''}
            onChange={v => setEditing({ ...editing, content: v })}
            minHeight="320px"
          />
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)', cursor: 'none' }}>
            <input type="checkbox" checked={editing.published ?? false} onChange={e => setEditing({ ...editing, published: e.target.checked })} />
            Published
          </label>
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <NeonButton variant="purple" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</NeonButton>
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
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Blog Posts</h1>
        <NeonButton variant="purple" onClick={() => setEditing({})}>+ New Post</NeonButton>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <GlassCard key={post.id} className="flex items-center justify-between p-5 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{post.title}</span>
                  {post.published ? <NeonBadge color="purple">Published</NeonBadge> : <NeonBadge color="white">Draft</NeonBadge>}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.slug}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <NeonButton variant="purple" onClick={() => setEditing(post)}>Edit</NeonButton>
                <NeonButton variant="pink" onClick={() => remove(post.id)}>Delete</NeonButton>
              </div>
            </GlassCard>
          ))}
          {posts.length === 0 && (
            <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No posts yet. Write your first!</p>
          )}
        </div>
      )}
    </div>
  )
}
