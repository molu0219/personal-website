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
    // This page defines its own openGraph, which replaces the inherited site card: re-add it.
    images: [{ url: 'https://0xjoeytw.xyz/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://0xjoeytw.xyz/opengraph-image'],
    title: 'About — Joey Chen',
    description: 'About Joey Chen — Product Manager & AI Builder. Focused on Claude Code workflows, AI-assisted development, and Web3.',
    creator: '@0xjoeytw',
  },
}
import GlyphPortrait from '@/components/art/GlyphPortrait'
import TerminalBlock from '@/components/ui/TerminalBlock'

interface AboutData {
  name?: string | null
  title?: string | null
  bio?: string | null
  skills?: string[] | null
  social_links?: Record<string, string> | null
  avatar_url?: string | null
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
      <header className="grid gap-10 pt-24 pb-12 md:grid-cols-[1fr_auto] md:items-end md:pt-28">
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
          <figure className="m-0">
            <GlyphPortrait
              src="/avatar.png"
              alt={`${name}, drawn in ASCII`}
              cols={120}
              className="text-[4px] leading-[4px] md:text-[6px] md:leading-[6px]"
            />
            <figcaption className="mt-3 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              avatar.png → glyphs · move to disturb · click to scatter
            </figcaption>
          </figure>
        )}
      </header>

      <TerminalBlock command="cat about.md">
        <div className="max-w-[62ch] space-y-5">
          {bio.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-base md:text-lg leading-[1.9]" style={{ color: 'var(--text-primary)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      </TerminalBlock>

      <TerminalBlock command="tree ~/skills">
        <SkillTree groups={skillCategories.length ? skillCategories : [{ label: 'stack', items: skills }]} />
      </TerminalBlock>

      {Object.keys(social).length > 0 && (
        <TerminalBlock command="ls -l ~/elsewhere">
          <LinkList links={social} />
        </TerminalBlock>
      )}
    </div>
  )
}

const mono = { fontFamily: 'var(--font-mono)' }

/** `tree` output: groups are directories, skills are files. Pure ASCII branches. */
function SkillTree({ groups }: { groups: { label: string; items: string[] }[] }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <pre className="m-0 text-sm leading-7 overflow-x-auto" style={mono}>
      <span style={{ color: 'var(--accent)' }}>~/skills</span>
      {'\n'}
      {groups.map((g, gi) => {
        const lastGroup = gi === groups.length - 1
        return (
          <span key={g.label}>
            <span style={{ color: 'var(--text-muted)' }}>{lastGroup ? '`-- ' : '|-- '}</span>
            <span style={{ color: 'var(--accent)' }}>{g.label.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}/</span>
            {'\n'}
            {g.items.map((item, ii) => (
              <span key={item}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {lastGroup ? '    ' : '|   '}
                  {ii === g.items.length - 1 ? '`-- ' : '|-- '}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                {'\n'}
              </span>
            ))}
          </span>
        )
      })}
      {'\n'}
      <span style={{ color: 'var(--text-muted)' }}>
        {groups.length} directories, {total} files
      </span>
    </pre>
  )
}

/** `ls -l` output: each social link is a symlink. */
function LinkList({ links }: { links: Record<string, string> }) {
  const entries = Object.entries(links)
  const width = Math.max(...entries.map(([k]) => k.length))
  return (
    <pre className="m-0 text-sm leading-8 overflow-x-auto" style={mono}>
      <span style={{ color: 'var(--text-muted)' }}>total {entries.length}</span>
      {'\n'}
      {entries.map(([key, url]) => (
        <span key={key}>
          <span style={{ color: 'var(--text-muted)' }}>lrwxr-xr-x  joey  </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer me"
            className="group transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-primary)' }}
          >
            {key.toLowerCase().padEnd(width)}
            <span style={{ color: 'var(--text-muted)' }}> -&gt; </span>
            <span className="underline decoration-[var(--border-strong)] underline-offset-4 group-hover:decoration-[var(--accent)]">
              {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </span>
          </a>
          {'\n'}
        </span>
      ))}
    </pre>
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
