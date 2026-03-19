import { createClient } from '@/lib/supabase/server'
import NeonBadge from '@/components/ui/NeonBadge'

export default async function AuthorCard() {
  let author: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('about')
      .select('name, avatar_url, signature_description, signature_tags')
      .single()
    author = data
  } catch {}

  if (!author) return null

  const name = author.name ?? 'Joey Chen'
  const description = author.signature_description ?? ''
  const tags: string[] = author.signature_tags ?? []
  const avatar = author.avatar_url

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
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => (
              <NeonBadge key={tag} color="cyan">{tag}</NeonBadge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
