'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import GlassCard from '@/components/ui/GlassCard'
import NeonButton from '@/components/ui/NeonButton'
import GlassInput from '@/components/ui/GlassInput'

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
        <GlassInput label="Name" value={data.name ?? ''} onChange={e => setData({ ...data, name: e.target.value })} className="w-full" />
        <GlassInput label="Title / Role" value={data.title ?? ''} onChange={e => setData({ ...data, title: e.target.value })} className="w-full" />
        <GlassInput label="Avatar URL" value={data.avatar_url ?? ''} onChange={e => setData({ ...data, avatar_url: e.target.value })} className="w-full" />
        <div>
          <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Bio</label>
          <textarea
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-32"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical' }}
            value={data.bio ?? ''}
            onChange={e => setData({ ...data, bio: e.target.value })}
          />
        </div>
        <GlassInput
          label="Skills (comma-separated)"
          value={Array.isArray(data.skills) ? data.skills.join(', ') : ''}
          onChange={e => setData({ ...data, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
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
