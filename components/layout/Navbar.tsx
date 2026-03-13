'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--surface)' : 'color-mix(in srgb, var(--surface) 60%, transparent)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        }}
      >
        <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="gradient-text">JC</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link-hover relative px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'color-mix(in srgb, var(--cyan) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--cyan) 25%, transparent)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--text-secondary)', cursor: 'none' }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 space-y-1.5">
              <span className="block h-px w-full transition-all" style={{ background: menuOpen ? 'var(--cyan)' : 'currentColor' }} />
              <span className="block h-px w-3/4 transition-all" style={{ background: menuOpen ? 'var(--cyan)' : 'currentColor' }} />
              <span className="block h-px w-full transition-all" style={{ background: menuOpen ? 'var(--cyan)' : 'currentColor' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 mx-auto max-w-6xl rounded-2xl overflow-hidden"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-6 py-4 text-sm transition-colors"
                style={{ color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
