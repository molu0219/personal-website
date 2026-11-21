'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from '@/components/ui/ThemeToggle'

const links = [
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false) // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color] duration-200"
      style={{
        background: scrolled || menuOpen ? 'color-mix(in srgb, var(--bg) 85%, transparent)' : 'transparent',
        borderColor: scrolled || menuOpen ? 'var(--border)' : 'transparent',
        backdropFilter: scrolled || menuOpen ? 'saturate(180%) blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'saturate(180%) blur(12px)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-medium tracking-tight"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
        >
          joey<span style={{ color: 'var(--accent)' }}>@</span>chen
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(link => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className="px-3 py-1.5 rounded-md text-sm transition-colors hover:text-[var(--text-primary)]"
                style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            )
          })}
          <span className="mx-2 h-4 w-px" style={{ background: 'var(--border)' }} />
          <ThemeToggle />
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 -mr-2"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setMenuOpen(o => !o)}
          >
            <div className="relative w-5 h-3">
              <span
                className="absolute left-0 h-px w-full bg-current transition-transform duration-200"
                style={{ top: menuOpen ? 6 : 0, transform: menuOpen ? 'rotate(45deg)' : 'none' }}
              />
              <span
                className="absolute left-0 h-px w-full bg-current transition-transform duration-200"
                style={{ top: menuOpen ? 6 : 12, transform: menuOpen ? 'rotate(-45deg)' : 'none' }}
              />
            </div>
          </button>
        </div>
      </div>

      <div
        className="md:hidden grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: menuOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-4">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-base border-b"
                style={{
                  borderColor: 'var(--border)',
                  color: isActive(pathname, link.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
