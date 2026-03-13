'use client'

import { motion } from 'framer-motion'
import NeonButton from '@/components/ui/NeonButton'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: 'color-mix(in srgb, var(--cyan) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--cyan) 25%, transparent)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--cyan)' }}
            />
            <span className="text-xs" style={{ color: 'var(--cyan)' }}>
              Available for opportunities
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span style={{ color: 'var(--text-primary)' }}>Hey, I&apos;m </span>
            <span className="gradient-text-animated">Joey Chen</span>
          </h1>

          <p
            className="text-lg md:text-xl mb-4"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
          >
            Blockchain Developer · Builder · Creator
          </p>

          <p
            className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            I build decentralized applications, explore on-chain analytics,
            and create generative art experiences at the intersection of code and creativity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NeonButton href="/projects" variant="cyan">View Projects</NeonButton>
            <NeonButton href="/blog" variant="purple">Read Blog</NeonButton>
            <NeonButton href="/about" variant="ghost">About Me</NeonButton>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div
            className="w-px h-12 mx-auto"
            style={{ background: 'linear-gradient(to bottom, var(--cyan), transparent)' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
