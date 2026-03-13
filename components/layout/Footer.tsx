'use client'

import { Github, Twitter, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'

const socials = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer
      className="relative mt-24 px-6 py-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © 2025 Joey Chen. Built with Next.js & Supabase.
        </span>
        <div className="flex items-center gap-4">
          {socials.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                cursor: 'none',
              }}
              whileHover={{
                scale: 1.15,
                color: 'var(--cyan)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={16} />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  )
}
