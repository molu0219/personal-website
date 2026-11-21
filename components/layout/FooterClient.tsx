import Link from 'next/link'
import { Github, Globe, Youtube, Instagram, Send } from 'lucide-react'
import AsciiKnot from '@/components/art/AsciiKnot'

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const ICON_MAP: Record<string, React.ElementType> = {
  github: Github,
  twitter: XIcon,
  x: XIcon,
  youtube: Youtube,
  instagram: Instagram,
  telegram: Send,
}

const SITE_LINKS = [
  { href: '/blog', label: 'Writing' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
]

const mono = { fontFamily: 'var(--font-mono)' }

interface Props {
  socials: Record<string, string>
}

export default function FooterClient({ socials }: Props) {
  const entries = Object.entries(socials)

  return (
    <footer className="mt-24 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto grid gap-10 py-14 md:grid-cols-[1fr_auto_260px] md:items-end">
        <div>
          <Link href="/" className="text-sm" style={{ ...mono, color: 'var(--text-primary)' }}>
            joey<span style={{ color: 'var(--accent)' }}>@</span>chen
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Notes and builds on AI agents, developer workflows and on-chain work.
          </p>
          {entries.length > 0 && (
            <div className="mt-6 flex items-center gap-1">
              {entries.map(([key, href]) => {
                const Icon = ICON_MAP[key.toLowerCase()] ?? Globe
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={key}
                    className="grid h-9 w-9 place-items-center rounded-lg transition-colors duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Icon size={16} />
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <nav aria-label="Footer" className="flex gap-6 text-sm md:flex-col md:gap-2">
          {SITE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--text-primary)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AsciiKnot
          shape={{ p: 3, q: 4 }}
          speed={0.4}
          glyphClass="text-[6px] leading-[6px]"
          className="hidden md:block h-[160px]"
        />
      </div>

      <div
        className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 border-t py-6 text-xs"
        style={{ ...mono, borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <span>© {new Date().getFullYear()} Joey Chen</span>
        <span>
          <Link href="/privacy" className="transition-colors hover:text-[var(--text-secondary)]">
            privacy
          </Link>
          <span className="mx-2">·</span>
          -- EOF --
        </span>
      </div>
    </footer>
  )
}
