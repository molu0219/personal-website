'use client'

import { useRef, useState } from 'react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Cover Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (!res.ok) {
      setError(json.error ?? 'Upload failed')
    } else {
      onChange(json.url)
    }
  }

  return (
    <div>
      <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div
        className="relative overflow-hidden transition-all"
        style={{
          border: '1px dashed var(--border)',
          borderRadius: 8,
          minHeight: 120,
          background: 'var(--surface)',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file && !uploading) upload(file)
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Cover preview" className="w-full object-cover" style={{ height: 160 }} />
            {!uploading && (
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                <span className="text-sm font-mono" style={{ color: '#fff' }}>Click to change</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2" style={{ height: 120 }}>
            <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>⬆</span>
            <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
              Click or drag image to upload
            </p>
          </div>
        )}

        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <span className="text-sm font-mono" style={{ color: 'var(--cyan)' }}>Uploading…</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs mt-1" style={{ color: 'var(--pink)' }}>{error}</p>}

      {value && !uploading && (
        <button
          type="button"
          className="text-xs mt-1 font-mono underline"
          style={{ color: 'var(--text-muted)', cursor: 'none' }}
          onClick={() => onChange('')}
        >
          Remove image
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
