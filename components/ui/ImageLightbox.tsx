'use client'

import { useEffect, useCallback, useState } from 'react'

export default function ImageLightbox() {
  const [src, setSrc] = useState<string | null>(null)

  const close = useCallback(() => setSrc(null), [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest('.prose-theme img, .prose-cyberpunk img') as HTMLImageElement | null
      if (img) {
        e.preventDefault()
        setSrc(img.src)
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [close])

  if (!src) return null

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        padding: 24,
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: 12,
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  )
}
