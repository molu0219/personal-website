'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const STORAGE_KEY = 'crt-ad-closed'

export default function CrtAdTerminal() {
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const termRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    const mobile = window.innerWidth < 768
    setIsMobile(mobile)

    if (!mobile) {
      setPos({
        x: window.innerWidth - 340 - 24,
        y: window.innerHeight - 300 - 24,
      })
    }

    setVisible(true)

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {}
  }, [])

  const handleClose = () => {
    setVisible(false)
    sessionStorage.setItem(STORAGE_KEY, '1')
  }

  // Drag handlers — desktop only
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile) return
    if ((e.target as HTMLElement).closest('[data-close-btn]')) return
    e.preventDefault()
    const el = termRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    setDragging(true)
  }, [pos, isMobile])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setPos({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    })
  }, [dragging])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    termRef.current?.releasePointerCapture(e.pointerId)
    setDragging(false)
  }, [dragging])

  if (!visible) return null

  // Shared CRT shell
  const crtShell = (
    <div
      style={{
        borderRadius: 14,
        border: '2px solid rgba(0, 255, 136, 0.3)',
        background: 'rgba(0, 10, 5, 0.92)',
        boxShadow: `
          0 0 20px rgba(0, 255, 136, 0.08),
          0 0 60px rgba(0, 255, 136, 0.04),
          inset 0 0 30px rgba(0, 255, 136, 0.03)
        `,
        overflow: 'hidden',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderBottom: '1px solid rgba(0, 255, 136, 0.15)',
          background: 'rgba(0, 255, 136, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
          <span
            style={{
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: 11,
              color: 'rgba(0, 255, 136, 0.7)',
              marginLeft: 6,
              letterSpacing: '0.05em',
            }}
          >
            sponsor.exe
          </span>
        </div>
        <button
          data-close-btn
          onClick={handleClose}
          style={{
            background: 'none',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 3,
            color: 'rgba(0, 255, 136, 0.7)',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 11,
            padding: '1px 6px',
            cursor: 'pointer',
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 80, 80, 0.2)'
            e.currentTarget.style.borderColor = 'rgba(255, 80, 80, 0.5)'
            e.currentTarget.style.color = '#ff5050'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none'
            e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)'
            e.currentTarget.style.color = 'rgba(0, 255, 136, 0.7)'
          }}
        >
          [X]
        </button>
      </div>

      {/* Content area */}
      <div style={{ position: 'relative', padding: 10, minHeight: isMobile ? 100 : 200 }}>
        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 136, 0.015) 2px,
              rgba(0, 255, 136, 0.015) 4px
            )`,
            zIndex: 1,
          }}
        />

        {/* Glow overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.03) 0%, transparent 70%)',
            zIndex: 1,
          }}
        />

        {/* Ad unit */}
        <div style={{ position: 'relative', zIndex: 0 }}>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-9548192708890896"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Boot text */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 9,
            color: 'rgba(0, 255, 136, 0.3)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          &gt; loading sponsored content...
        </div>
      </div>
    </div>
  )

  // Mobile: inline block at bottom of page
  if (isMobile) {
    return (
      <div style={{ padding: '0 16px 24px', position: 'relative', zIndex: 10 }}>
        {crtShell}
      </div>
    )
  }

  // Desktop: fixed draggable floating window
  return (
    <div
      ref={termRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        width: 340,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {crtShell}
    </div>
  )
}
