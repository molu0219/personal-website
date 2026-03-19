'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import GlassInput from '@/components/ui/GlassInput'
import ImageUpload from '@/components/ui/ImageUpload'
import TagInput from '@/components/ui/TagInput'

export default function AdminAbout() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [socialLinksJson, setSocialLinksJson] = useState('{}')

  const supabase = createClient()

  useEffect(() => {
    supabase.from('about').select('*').single().then(({ data: d }) => {
      if (d) {
        setData(d)
        setSocialLinksJson(JSON.stringify(d.social_links ?? {}, null, 2))
      }
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    setError('')
    const payload = { ...data, updated_at: new Date().toISOString() }
    const { error: err } = data.id
      ? await supabase.from('about').update(payload).eq('id', data.id)
      : await supabase.from('about').insert(payload)
    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
        About Info
      </h1>
      <GlassCard className="p-6 space-y-4">
        <p className="text-xs uppercase tracking-widest font-semibold pt-2" style={{ color: 'var(--cyan)', fontFamily: 'Space Grotesk, sans-serif' }}>Home / Hero</p>
        <GlassInput label="Name" value={data.name ?? ''} onChange={e => setData({ ...data, name: e.target.value })} className="w-full" />
        <GlassInput label="Tagline (hero subtitle)" value={data.title ?? ''} onChange={e => setData({ ...data, title: e.target.value })} className="w-full" />
        <div>
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Hero Description</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-24"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            value={data.hero_description ?? ''}
            onChange={e => setData({ ...data, hero_description: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-4">
          <GlassInput label="Status Pill Text" value={data.status_text ?? ''} onChange={e => setData({ ...data, status_text: e.target.value })} className="flex-1" />
          <label className="flex items-center gap-2 mt-5 cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={data.status_active ?? true}
              onChange={e => setData({ ...data, status_active: e.target.checked })}
              className="w-4 h-4 accent-cyan-400"
            />
            <span className="text-sm">Show</span>
          </label>
        </div>

        <p className="text-xs uppercase tracking-widest font-semibold pt-4" style={{ color: 'var(--purple)', fontFamily: 'Space Grotesk, sans-serif' }}>Author Signature / About Page</p>
        <ImageUpload
          label="Avatar"
          value={data.avatar_url ?? ''}
          onChange={url => setData({ ...data, avatar_url: url })}
        />
        <GlassInput label="Signature Description (short bio for article footer)" value={data.signature_description ?? ''} onChange={e => setData({ ...data, signature_description: e.target.value })} className="w-full" />
        <TagInput
          label="Signature Tags (comma-separated, e.g. Blockchain, AI, Web3)"
          value={Array.isArray(data.signature_tags) ? data.signature_tags : []}
          onChange={tags => setData({ ...data, signature_tags: tags })}
          className="w-full"
        />
        <div>
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Bio (about page)</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-32"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            value={data.bio ?? ''}
            onChange={e => setData({ ...data, bio: e.target.value })}
          />
        </div>
        <TagInput
          label="Skills (comma-separated)"
          value={Array.isArray(data.skills) ? data.skills : []}
          onChange={tags => setData({ ...data, skills: tags })}
          className="w-full"
        />
        <div>
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Social Links (JSON)</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-20 font-mono"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            value={socialLinksJson}
            onChange={e => {
              setSocialLinksJson(e.target.value)
              try {
                const parsed = JSON.parse(e.target.value)
                setData({ ...data, social_links: parsed })
              } catch {}
            }}
          />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <NeonButton variant="pink" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</NeonButton>
          {saved && <span className="text-sm" style={{ color: 'var(--cyan)' }}>Saved!</span>}
          {error && <span className="text-sm" style={{ color: 'var(--pink)' }}>{error}</span>}
        </div>
      </GlassCard>
    </div>
  )
}
