'use client'

import { useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

// Toolbar button config
const TOOLBAR = [
  { key: 'b', label: 'B', title: 'Bold (Ctrl+B)', wrap: ['**', '**'], style: { fontWeight: 700 } },
  { key: 'i', label: 'I', title: 'Italic (Ctrl+I)', wrap: ['*', '*'], style: { fontStyle: 'italic' } },
  { key: 's', label: 'S', title: 'Strikethrough (Ctrl+S)', wrap: ['~~', '~~'], style: { textDecoration: 'line-through' } },
  null, // separator
  { key: 'h2', label: 'H2', title: 'Heading 2', prefix: '## ' },
  { key: 'h3', label: 'H3', title: 'Heading 3', prefix: '### ' },
  null,
  { key: 'ul', label: '???', title: 'Bullet List', prefix: '- ' },
  { key: 'ol', label: '1.', title: 'Numbered List', prefix: '1. ' },
  { key: 'quote', label: '???', title: 'Quote', prefix: '> ' },
  null,
  { key: 'code', label: '`', title: 'Inline Code (Ctrl+`)', wrap: ['`', '`'] },
  { key: 'codeblock', label: '```', title: 'Code Block', wrap: ['```\n', '\n```'] },
  { key: 'link', label: '????', title: 'Link (Ctrl+K)', action: 'link' },
] as const

type ToolItem = (typeof TOOLBAR)[number]

export default function MarkdownEditor({ label, value, onChange, placeholder, minHeight = '240px' }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Get selection helper
  const getSelection = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return { start: value.length, end: value.length, text: '' }
    return { start: ta.selectionStart, end: ta.selectionEnd, text: value.slice(ta.selectionStart, ta.selectionEnd) }
  }, [value])

  // Replace selection and position cursor
  const replaceSelection = useCallback((start: number, end: number, replacement: string, cursorOffset?: number) => {
    const newValue = value.slice(0, start) + replacement + value.slice(end)
    onChange(newValue)
    const cursorPos = cursorOffset !== undefined ? start + cursorOffset : start + replacement.length
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (ta) { ta.selectionStart = ta.selectionEnd = cursorPos; ta.focus() }
    })
  }, [value, onChange])

  const insertAtCursor = useCallback((text: string) => {
    const { start, end } = getSelection()
    replaceSelection(start, end, text)
  }, [getSelection, replaceSelection])

  // Wrap selected text or insert placeholder
  const wrapSelection = useCallback((before: string, after: string) => {
    const { start, end, text } = getSelection()
    if (text) {
      replaceSelection(start, end, before + text + after, start + before.length + text.length + after.length)
    } else {
      const placeholder = 'text'
      replaceSelection(start, end, before + placeholder + after, start + before.length)
      // Select the placeholder
      requestAnimationFrame(() => {
        const ta = textareaRef.current
        if (ta) { ta.selectionStart = start + before.length; ta.selectionEnd = start + before.length + placeholder.length; ta.focus() }
      })
    }
  }, [getSelection, replaceSelection])

  // Add prefix to current line(s)
  const prefixLine = useCallback((prefix: string) => {
    const { start, end } = getSelection()
    // Find line start
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end)
    const actualEnd = lineEnd === -1 ? value.length : lineEnd
    const lines = value.slice(lineStart, actualEnd).split('\n')
    const prefixed = lines.map(l => prefix + l).join('\n')
    replaceSelection(lineStart, actualEnd, prefixed)
  }, [value, getSelection, replaceSelection])

  // Insert link
  const insertLink = useCallback(() => {
    const { start, end, text } = getSelection()
    if (text) {
      replaceSelection(start, end, `[${text}](url)`, start + text.length + 3)
      requestAnimationFrame(() => {
        const ta = textareaRef.current
        if (ta) { ta.selectionStart = start + text.length + 3; ta.selectionEnd = start + text.length + 6; ta.focus() }
      })
    } else {
      replaceSelection(start, end, '[link text](url)', start + 1)
      requestAnimationFrame(() => {
        const ta = textareaRef.current
        if (ta) { ta.selectionStart = start + 1; ta.selectionEnd = start + 10; ta.focus() }
      })
    }
  }, [getSelection, replaceSelection])

  // Handle toolbar click
  const handleToolAction = useCallback((tool: ToolItem) => {
    if (!tool) return
    if ('action' in tool && tool.action === 'link') return insertLink()
    if ('wrap' in tool && tool.wrap) return wrapSelection(tool.wrap[0], tool.wrap[1])
    if ('prefix' in tool && tool.prefix) return prefixLine(tool.prefix)
  }, [insertLink, wrapSelection, prefixLine])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    const key = e.key.toLowerCase()
    if (key === 'b') { e.preventDefault(); wrapSelection('**', '**') }
    else if (key === 'i') { e.preventDefault(); wrapSelection('*', '*') }
    else if (key === 'k') { e.preventDefault(); insertLink() }
    else if (key === '`') { e.preventDefault(); wrapSelection('`', '`') }
  }, [wrapSelection, insertLink])

  // Image upload
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
      if (url) insertAtCursor(`\n![${file.name}](${url})\n`)
    }
    setUploading(false)
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    if (imageItems.length === 0) return
    e.preventDefault()
    await handleFiles(imageItems.map(item => item.getAsFile()).filter(Boolean) as File[])
  }

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.currentTarget.style.borderColor = 'var(--border)'
    await handleFiles(Array.from(e.dataTransfer.files))
  }

  const btnStyle = {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 4,
    color: 'var(--text-muted)',
    fontSize: 12,
    padding: '2px 8px',
    cursor: 'pointer',
    lineHeight: '20px',
    fontFamily: '"Courier New", Courier, monospace',
    transition: 'all 0.1s',
  }

  return (
    <div>
      {label && (
        <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      )}

      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-t-lg flex-wrap"
        style={{
          background: 'color-mix(in srgb, var(--surface) 80%, var(--bg))',
          border: '1px solid var(--border)',
          borderBottom: 'none',
        }}
      >
        {TOOLBAR.map((tool, i) => {
          if (!tool) return <div key={i} style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />
          return (
            <button
              key={tool.key}
              type="button"
              title={tool.title}
              onClick={() => handleToolAction(tool)}
              style={{ ...btnStyle, ...('style' in tool && tool.style ? tool.style as any : {}) }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {tool.label}
            </button>
          )
        })}

        <div style={{ flex: 1 }} />

        {uploading && <span className="text-xs" style={{ color: 'var(--cyan)' }}>Uploading...</span>}
        <button
          type="button"
          title="Upload Image"
          onClick={() => fileInputRef.current?.click()}
          style={btnStyle}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + Image
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full px-4 py-2.5 rounded-b-lg text-sm outline-none font-mono"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          color: 'var(--text-primary)',
          resize: 'vertical',
          minHeight,
          transition: 'border-color 0.15s',
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--cyan)' }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        placeholder={placeholder ?? 'Write markdown... (paste or drag images here)'}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          handleFiles(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />

      {/* Shortcut hint */}
      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
        Ctrl+B bold · Ctrl+I italic · Ctrl+K link · Ctrl+` code · Paste/drag images
      </p>
    </div>
  )
}
