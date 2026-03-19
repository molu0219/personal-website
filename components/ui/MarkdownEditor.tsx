'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export default function MarkdownEditor({ label, value, onChange, placeholder, minHeight = '240px' }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) { onChange(value + text); return }

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newValue = value.slice(0, start) + text + value.slice(end)
    onChange(newValue)

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length
      ta.focus()
    })
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) return null

    const { url } = await res.json()
    return url
  }

  const handleFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (images.length === 0) return

    setUploading(true)
    for (const file of images) {
      const url = await uploadFile(file)
      if (url) {
        insertAtCursor(`\n![${file.name}](${url})\n`)
      }
    }
    setUploading(false)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    if (imageItems.length === 0) return

    e.preventDefault()
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[]
    await handleFiles(files)
  }

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.currentTarget.style.borderColor = 'var(--border)'
    const files = Array.from(e.dataTransfer.files)
    await handleFiles(files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.currentTarget.style.borderColor = 'var(--cyan)'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)'
  }

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
          <div className="flex items-center gap-2">
            {uploading && (
              <span className="text-xs" style={{ color: 'var(--cyan)' }}>Uploading...</span>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              + Image
            </button>
          </div>
        </div>
      )}
      <textarea
        ref={textareaRef}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none font-mono"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          resize: 'vertical',
          minHeight,
          transition: 'border-color 0.15s',
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        placeholder={placeholder ?? 'Write markdown... (paste or drag images here)'}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? [])
          handleFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
