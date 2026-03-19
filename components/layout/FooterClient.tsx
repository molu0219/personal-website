'use client'

import { Github, Globe, Youtube, Instagram, Send } from 'lucide-react'
import { motion } from 'framer-motion'

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const ICON_MAP: Record<string, React.ElementType> = {
  github:    Github,
  twitter:   XIcon,
  x:         XIcon,
  youtube:   Youtube,
  instagram: Instagram,
  telegram:  Send,
}

interface Props {
  socials: Record<string, string>
}

export default function FooterClient({ socials }: Props) {
  const entries = Object.entries(socials)

  return (
    <footer
      className="relative mt-24 px-6 py-10"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Joey Chen. Built with Next.js & Supabase.
        </span>
        {entries.length > 0 && (
          <div className="flex items-center gap-4">
            {entries.map(([key, href]) => {
              const Icon = ICON_MAP[key.toLowerCase()] ?? Globe
              return (
                <motion.a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={key}
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'none',
                  }}
                  whileHover={{ scale: 1.15, color: 'var(--cyan)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                </motion.a>
              )
            })}
          </div>
        )}
      </div>
    </footer>
  )
}
