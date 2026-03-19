'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

function parseHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  const idCount: Record<string, number> = {}
  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/[*_`]/g, '').trim()
      let id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      // Deduplicate IDs (matches rehype-slug behavior)
      idCount[id] = (idCount[id] ?? 0) + 1
      if (idCount[id] > 1) id = `${id}-${idCount[id] - 1}`
      headings.push({ id, text, level })
    }
  }
  return headings
}

export default function TableOfContents({ content }: { content: string }) {
  const [activeId, setActiveId] = useState<string>('')
  const headings = parseHeadings(content)

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
  }, [headings.length])

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
