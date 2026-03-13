'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverRipple?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', hoverRipple = false, onClick }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [ripple, setRipple] = useState({ x: 50, y: 50, visible: false })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverRipple || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setRipple({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      visible: true,
    })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`rounded-2xl overflow-hidden relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setRipple(r => ({ ...r, visible: false })); setHovered(false) }}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      style={{
        background: ripple.visible
          ? `radial-gradient(circle at ${ripple.x}% ${ripple.y}%, var(--glass-hover) 0%, var(--surface) 60%)`
          : 'var(--surface)',
        border: `1px solid ${hovered ? 'var(--cyan)' : 'var(--border)'}`,
        boxShadow: hovered ? 'var(--shadow-hover)' : 'var(--shadow-sm)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {children}
    </motion.div>
  )
}
