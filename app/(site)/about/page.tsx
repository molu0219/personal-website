import { unstable_rethrow } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About — Joey Chen',
  description: 'About Joey Chen — Product Manager & AI Builder. Focused on Claude Code workflows, AI-assisted development, and Web3.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About — Joey Chen',
    description: 'About Joey Chen — Product Manager & AI Builder. Focused on Claude Code workflows, AI-assisted development, and Web3.',
    url: 'https://0xjoeytw.xyz/about',
    type: 'profile',
    siteName: 'Joey Chen',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary',
    title: 'About — Joey Chen',
    description: 'About Joey Chen — Product Manager & AI Builder. Focused on Claude Code workflows, AI-assisted development, and Web3.',
    creator: '@0xjoeytw',
  },
}
import NeonBadge from '@/components/ui/NeonBadge'
import { Github, Globe, Youtube, Instagram, Send } from 'lucide-react'
import AsciiPortrait from '@/components/art/AsciiPortrait'

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  github: Github,
  twitter: XIcon,
  x: XIcon,
  youtube: Youtube,
  instagram: Instagram,
  telegram: Send,
}

interface AboutData {
  name?: string | null
  title?: string | null
  bio?: string | null
  skills?: string[] | null
  social_links?: Record<string, string> | null
  avatar_url?: string | null
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 py-10 border-b md:grid-cols-[200px_1fr] md:gap-10" style={{ borderColor: 'var(--border)' }}>
      <h2 className="text-xs pt-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {label}
      </h2>
      <div>{children}</div>
    </section>
  )
}

export default async function AboutPage() {
  let about: AboutData | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('about').select('*').single()
    about = data
  } catch (err) {
    unstable_rethrow(err)
    console.error('[about] failed to load about', err)
  }

  const name = about?.name ?? 'Joey Chen'
  const title = about?.title ?? 'Product Manager & AI Builder'
  const bio = about?.bio ?? '我是 Joey Chen，一個對去中心化技術和 AI 開發充滿熱情的 PM。目前專注於用 Claude Code 打造高效的 AI 輔助開發工作流，並將實踐經驗寫成系列文章分享。\n\n這個網站是我的數位花園，記錄技術探索、專案作品、以及從實戰中學到的東西。所有內容都是真實開發經驗的結晶，不是理論空談。'
  const skills: string[] = about?.skills ?? ['Solidity', 'TypeScript', 'React', 'Next.js', 'Rust', 'Python', 'SQL', 'Web3.js', 'Supabase', 'Cloudflare']
  const social: Record<string, string> = about?.social_links ?? {}
  const skillCategories = groupSkills(skills)

  return (
    <div className="max-w-6xl mx-auto px-6 pb-24">
      <header className="pt-32 pb-12 md:pt-40 md:pb-16 border-b flex flex-col-reverse gap-8 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            ~/about
          </p>
          <h1
            className="text-4xl md:text-6xl font-medium tracking-[-0.03em] leading-[1.05]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {name}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p className="mt-4 text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {title}
          </p>
        </div>
        {about?.avatar_url && (
          <div className="flex items-end gap-5">
            <AsciiPortrait
              src={about.avatar_url}
              cols={56}
              className="hidden sm:block text-[6px] leading-[6px] md:text-[7px] md:leading-[7px]"
            />
            <img
              src={about.avatar_url}
              alt={name}
              className="h-24 w-24 md:h-32 md:w-32 rounded-lg object-cover border"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        )}
      </header>

      <Row label="About">
        <div className="max-w-[62ch] space-y-5">
          {bio.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-base md:text-lg leading-[1.9]" style={{ color: 'var(--text-primary)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </Row>

      <Row label="Skills">
        {skillCategories.length > 1 ? (
          <dl className="space-y-6">
            {skillCategories.map(({ label, items }) => (
              <div key={label} className="grid gap-2 sm:grid-cols-[140px_1fr] sm:gap-6">
                <dt className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {items.map(skill => <NeonBadge key={skill}>{skill}</NeonBadge>)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {skills.map(skill => <NeonBadge key={skill}>{skill}</NeonBadge>)}
          </div>
        )}
      </Row>

      {Object.keys(social).length > 0 && (
        <Row label="Elsewhere">
          <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 max-w-xl">
            {Object.entries(social).map(([key, url]) => {
              const Icon = SOCIAL_ICONS[key.toLowerCase()] ?? Globe
              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="group flex items-center gap-3 text-sm transition-colors hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Icon size={15} />
                    <span className="capitalize">{key}</span>
                    <span className="ml-auto opacity-0 -translate-x-1 transition-[opacity,transform] group-hover:opacity-100 group-hover:translate-x-0">↗</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Row>
      )}
    </div>
  )
}

const BLOCKCHAIN = ['Solidity', 'Rust', 'Web3.js', 'Ethers.js', 'Hardhat', 'Foundry', 'EVM', 'Cairo', 'Move', 'Anchor', 'Web3', 'Ethereum', 'Solana']
const FRONTEND = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind', 'Vue', 'Angular', 'Svelte', 'HTML', 'CSS']
const BACKEND = ['Node.js', 'Python', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'Supabase', 'Cloudflare', 'Docker', 'GraphQL', 'REST']

function groupSkills(skills: string[]): { label: string; items: string[]; color: 'cyan' | 'purple' | 'pink' }[] {
  const blockchain = skills.filter(s => BLOCKCHAIN.some(b => b.toLowerCase() === s.toLowerCase()))
  const frontend = skills.filter(s => FRONTEND.some(f => f.toLowerCase() === s.toLowerCase()))
  const backend = skills.filter(s =>
    BACKEND.some(b => b.toLowerCase() === s.toLowerCase()) &&
    !blockchain.includes(s) &&
    !frontend.includes(s)
  )
  const other = skills.filter(s => !blockchain.includes(s) && !frontend.includes(s) && !backend.includes(s))

  const result: { label: string; items: string[]; color: 'cyan' | 'purple' | 'pink' }[] = []
  if (blockchain.length) result.push({ label: 'Blockchain', items: blockchain, color: 'cyan' })
  if (frontend.length) result.push({ label: 'Frontend', items: frontend, color: 'purple' })
  if (backend.length) result.push({ label: 'Backend & Infra', items: backend, color: 'pink' })
  if (other.length) result.push({ label: 'Other', items: other, color: 'cyan' })

  return result.length >= 2 ? result : []
}
