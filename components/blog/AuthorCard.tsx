import { createClient } from '@/lib/supabase/server'
import NeonBadge from '@/components/ui/NeonBadge'
import { Github, Globe, Youtube, Instagram, Send } from 'lucide-react'

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
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

export default async function AuthorCard() {
  let author: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('about')
      .select('name, avatar_url, signature_description, signature_tags, social_links')
      .single()
    author = data
  } catch {}

  if (!author) return null

  const name = author.name ?? 'Joey Chen'
  const description = author.signature_description ?? ''
  const tags: string[] = author.signature_tags ?? []
  const avatar = author.avatar_url
  const socials: Record<string, string> = author.social_links ?? {}

  return (
    <div
      className="mt-12 pt-8 flex items-start gap-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="flex-shrink-0 rounded-full object-cover"
          style={{ width: 56, height: 56, border: '2px solid var(--border)' }}
        />
      )}
      <div className="min-w-0">
        <p
          className="font-semibold text-sm mb-1"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          {name}
        </p>
        {description && (
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map(tag => (
              <NeonBadge key={tag} color="cyan">{tag}</NeonBadge>
            ))}
          </div>
        )}
        {Object.keys(socials).length > 0 && (
          <div className="flex items-center gap-3">
            {Object.entries(socials).map(([key, href]) => {
              const Icon = ICON_MAP[key.toLowerCase()] ?? Globe
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title={key}
                >
                  <Icon size={14} />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
