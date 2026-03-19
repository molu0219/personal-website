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

// Toolbar buttons - using plain text labels to avoid encoding issues
const TOOLBAR: (ToolDef | null)[] = [
  { key: 'b', label: 'B', title: 'Bold (Ctrl+B)', wrap: ['**', '**'], labelStyle: { fontWeight: 700 } },
  { key: 'i', label: 'I', title: 'Italic (Ctrl+I)', wrap: ['*', '*'], labelStyle: { fontStyle: 'italic' } },
  { key: 's', label: 'S', title: 'Strikethrough', wrap: ['~~', '~~'], labelStyle: { textDecoration: 'line-through' } },
  null,
  { key: 'h2', label: 'H2', title: 'Heading 2', prefix: '## ' },
  { key: 'h3', label: 'H3', title: 'Heading 3', prefix: '### ' },
  null,
  { key: 'ul', label: '- ', title: 'Bullet List', prefix: '- ' },
  { key: 'ol', label: '1.', title: 'Numbered List', prefix: '1. ' },
  { key: 'quote', label: '> ', title: 'Quote', prefix: '> ' },
  null,
  { key: 'code', label: '<>', title: 'Inline Code (Ctrl+`)', wrap: ['`', '`'] },
  { key: 'codeblock', label: '{ }', title: 'Code Block', wrap: ['```\n', '\n```'] },
  { key: 'link', label: 'Link', title: 'Link (Ctrl+K)', action: 'link' as const },
]

interface ToolDef {
  key: string
  label: string
  title: string
  wrap?: [string, string]
  prefix?: string
  action?: 'link'
  labelStyle?: React.CSSProperties
}

export default function MarkdownEditor({ label, value, onChange, placeholder, minHeight = '240px' }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // Use execCommand-based insertion to preserve undo history
  const insertText = useCallback((text: string) => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    // execCommand('insertText') preserves native undo/redo
    document.execCommand('insertText', false, text)
  }, [])

  // Get current selection
  const getSelection = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return { start: 0, end: 0, text: '' }
    return { start: ta.selectionStart, end: ta.selectionEnd, text: value.slice(ta.selectionStart, ta.selectionEnd) }
  }, [value])

  // Wrap selected text
  const wrapSelection = useCallback((before: string, after: string) => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    const { start, end, text } = getSelection()
    const selected = text || 'text'
    const replacement = before + selected + after

    ta.setSelectionRange(start, end)
    document.execCommand('insertText', false, replacement)

    // Select the inner text
    requestAnimationFrame(() => {
      ta.setSelectionRange(start + before.length, start + before.length + selected.length)
    })
  }, [getSelection])

  // Prefix current line
  const prefixLine = useCallback((prefix: string) => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    const { start } = getSelection()
    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    ta.setSelectionRange(lineStart, lineStart)
    document.execCommand('insertText', false, prefix)
  }, [value, getSelection])

  // Insert link
  const insertLink = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    const { start, end, text } = getSelection()

    if (text) {
      ta.setSelectionRange(start, end)
      document.execCommand('insertText', false, `[${text}](url)`)
      requestAnimationFrame(() => {
        ta.setSelectionRange(start + text.length + 3, start + text.length + 6)
      })
    } else {
      ta.setSelectionRange(start, end)
      document.execCommand('insertText', false, '[link text](url)')
      requestAnimationFrame(() => {
        ta.setSelectionRange(start + 1, start + 10)
      })
    }
  }, [getSelection])

  // Handle toolbar click
  const handleToolAction = useCallback((tool: ToolDef) => {
    if (tool.action === 'link') return insertLink()
    if (tool.wrap) return wrapSelection(tool.wrap[0], tool.wrap[1])
    if (tool.prefix) return prefixLine(tool.prefix)
  }, [insertLink, wrapSelection, prefixLine])

  // Keyboard shortcuts - only intercept specific combos, let everything else through
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    const key = e.key.toLowerCase()
    if (key === 'b') { e.preventDefault(); wrapSelection('**', '**') }
    else if (key === 'i') { e.preventDefault(); wrapSelection('*', '*') }
    else if (key === 'k') { e.preventDefault(); insertLink() }
    else if (key === '`') { e.preventDefault(); wrapSelection('`', '`') }
    // Do NOT intercept Ctrl+Z, Ctrl+Y, Ctrl+S, space, or anything else
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
      if (url) insertText(`\n![${file.name}](${url})\n`)
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

  const btnBase: React.CSSProperties = {
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
          if (!tool) return <div key={`sep-${i}`} style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />
          return (
            <button
              key={tool.key}
              type="button"
              title={tool.title}
              tabIndex={-1}
              onClick={() => handleToolAction(tool)}
              style={{ ...btnBase, ...(tool.labelStyle ?? {}) }}
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
          tabIndex={-1}
          onClick={() => fileInputRef.current?.click()}
          style={btnBase}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          + Img
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

      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
        Ctrl+B bold · Ctrl+I italic · Ctrl+K link · Ctrl+` code · Ctrl+Z undo · Paste/drag images
      </p>
    </div>
  )
}
