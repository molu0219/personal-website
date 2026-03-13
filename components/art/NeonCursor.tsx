'use client'

import { useEffect, useRef, useState } from 'react'
import { useMousePosition } from '@/hooks/useMousePosition'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

export default function NeonCursor() {
  const { x, y } = useMousePosition()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const posRef = useRef({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    posRef.current = { x, y }
    if (x > 0 || y > 0) setIsVisible(true)

    const colors = ['rgba(0,212,255,', 'rgba(191,0,255,', 'rgba(255,0,168,']
    if (Math.random() < 0.4) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
  }, [x, y])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(p => p.life > 0)
      for (const p of particlesRef.current) {
        p.life -= 0.04
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        const alpha = p.life * 0.7
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${alpha})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      />
      {/* Outer ring */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: x - 20,
          top: y - 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid color-mix(in srgb, var(--cyan) 60%, transparent)',
          boxShadow: '0 0 10px color-mix(in srgb, var(--cyan) 40%, transparent), inset 0 0 10px color-mix(in srgb, var(--cyan) 10%, transparent)',
          zIndex: 9998,
          transition: 'left 0.08s ease, top 0.08s ease',
        }}
      />
      {/* Inner dot */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: x - 3,
          top: y - 3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--cyan)',
          boxShadow: '0 0 6px var(--cyan), 0 0 12px var(--cyan)',
          zIndex: 9998,
        }}
      />
    </>
  )
}
