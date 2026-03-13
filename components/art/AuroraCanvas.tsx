'use client'

import { useEffect, useRef } from 'react'

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: [number, number, number]
  alpha: number
  noiseOffsetX: number
  noiseOffsetY: number
}

export default function AuroraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let animId: number
    let t = 0

    const colors: [number, number, number][] = [
      [0, 212, 255],
      [191, 0, 255],
      [255, 0, 168],
      [0, 150, 255],
      [100, 0, 255],
    ]

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const orbs: Orb[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 280 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.04,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    }))

    // Simple Perlin-like noise using sine
    const noise = (x: number, y: number) =>
      (Math.sin(x * 0.01) + Math.sin(y * 0.01) + Math.sin((x + y) * 0.007)) / 3

    const draw = () => {
      t += 0.003
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const orb of orbs) {
        orb.noiseOffsetX += 0.002
        orb.noiseOffsetY += 0.002
        orb.x += orb.vx + noise(orb.noiseOffsetX * 100, t * 100) * 0.6
        orb.y += orb.vy + noise(orb.noiseOffsetY * 100, t * 100 + 500) * 0.6

        if (orb.x < -orb.size) orb.x = canvas.width + orb.size
        if (orb.x > canvas.width + orb.size) orb.x = -orb.size
        if (orb.y < -orb.size) orb.y = canvas.height + orb.size
        if (orb.y > canvas.height + orb.size) orb.y = -orb.size

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size)
        const [r, g, b] = orb.color
        grad.addColorStop(0, `rgba(${r},${g},${b},${orb.alpha})`)
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${orb.alpha * 0.4})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Particle field
      ctx.save()
      for (let i = 0; i < 60; i++) {
        const px = ((i * 137.5 + t * 20) % canvas.width)
        const py = ((i * 73.1 + Math.sin(t + i * 0.3) * 50 + canvas.height / 2) % canvas.height)
        const size = Math.sin(t * 2 + i) * 0.8 + 1.2
        const alpha = (Math.sin(t + i * 0.5) + 1) * 0.15

        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${alpha})`
        ctx.fill()
      }
      ctx.restore()

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
