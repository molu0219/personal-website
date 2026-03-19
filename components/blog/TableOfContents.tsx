'use client'

import { useEffect, useState, useRef } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('')
  const [headings, setHeadings] = useState<Heading[]>([])
  const initialized = useRef(false)

  // Read headings from actual DOM after render (guaranteed ID match with rehype-slug)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Small delay to ensure markdown is rendered
    const timer = setTimeout(() => {
      const article = document.querySelector('.prose-theme')
      if (!article) return

      const els = article.querySelectorAll('h2[id], h3[id]')
      const found: Heading[] = []
      els.forEach(el => {
        found.push({
          id: el.id,
          text: el.textContent?.replace(/^#\s*/, '') ?? '',
          level: el.tagName === 'H2' ? 2 : 3,
        })
      })
      setHeadings(found)
    }, 100)

    return () => clearTimeout(timer)
  }, [content])

  // Observe headings for active state
  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.find(e => e.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-80px 0% -65% 0%' }
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        On this page
      </p>
      <ul className="space-y-1">
        {headings.map(h => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? '12px' : '0' }}>
            <a
              href={`#${h.id}`}
              onClick={e => {
                e.preventDefault()
                const el = document.getElementById(h.id)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-sm block py-1 transition-all"
              style={{
                color: activeId === h.id ? 'var(--cyan)' : 'var(--text-secondary)',
                borderLeft: `2px solid ${activeId === h.id ? 'var(--cyan)' : 'transparent'}`,
                paddingLeft: '8px',
                fontWeight: activeId === h.id ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
