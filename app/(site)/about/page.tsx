import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'About — Joey Chen',
  description: 'About Joey Chen — blockchain developer, builder, and creator.',
}
import GlassCard from '@/components/ui/GlassCard'
import NeonBadge from '@/components/ui/NeonBadge'
import NeonButton from '@/components/ui/NeonButton'
import { Github, Globe, Youtube, Instagram, Send } from 'lucide-react'

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

export default async function AboutPage() {
  let about: any = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('about').select('*').single()
    about = data
  } catch {}

  const name = about?.name ?? 'Joey Chen'
  const title = about?.title ?? 'Blockchain Developer & Builder'
  const bio = about?.bio ?? 'I build decentralized applications and explore the intersection of blockchain, AI, and generative art.'
  const skills: string[] = about?.skills ?? ['Solidity', 'TypeScript', 'React', 'Next.js', 'Rust', 'Python', 'SQL', 'Web3.js', 'Supabase', 'Cloudflare']
  const social = about?.social_links ?? {}

  const skillCategories = groupSkills(skills)

  return (
    <div className="relative z-10 min-h-screen pb-24">
      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--cyan) 6%, var(--bg)) 0%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* grid decoration */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(var(--cyan) 1px, transparent 1px), linear-gradient(90deg, var(--cyan) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-36 pb-20 flex flex-col sm:flex-row items-center sm:items-end gap-10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-36 h-36 rounded-2xl overflow-hidden"
              style={{
                border: '1px solid color-mix(in srgb, var(--cyan) 40%, transparent)',
                boxShadow: '0 0 0 1px color-mix(in srgb, var(--cyan) 15%, transparent), 0 0 40px color-mix(in srgb, var(--cyan) 18%, transparent), 0 0 80px color-mix(in srgb, var(--purple) 12%, transparent)',
              }}
            >
              {about?.avatar_url ? (
                <img src={about.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--cyan) 18%, var(--surface)), color-mix(in srgb, var(--purple) 18%, var(--surface)))',
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: 'var(--cyan)',
                  }}
                >
                  {name.charAt(0)}
                </div>
              )}
            </div>
            {/* glow ring */}
            <div
              className="absolute -inset-2 rounded-2xl -z-10"
              style={{
                background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                opacity: 0.2,
                filter: 'blur(10px)',
              }}
            />
          </div>

          {/* Identity */}
          <div className="flex-1 text-center sm:text-left">
            <p
              className="text-xs uppercase tracking-widest mb-2 font-medium"
              style={{ color: 'var(--cyan)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.2em' }}
            >
              {title}
            </p>
            <h1
              className="text-4xl sm:text-5xl font-bold leading-none mb-5"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                color: 'var(--text-primary)',
              }}
            >
              {name}
            </h1>

            {Object.keys(social).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {Object.entries(social).map(([key, url]) => {
                  const Icon = SOCIAL_ICONS[key.toLowerCase()] ?? Globe
                  return (
                    <NeonButton key={key} href={url as string} variant="ghost">
                      <Icon size={16} />
                      <span className="ml-1.5">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </NeonButton>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-6 mt-14 space-y-8">
        {/* Bio */}
        <GlassCard className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, var(--cyan), var(--purple))' }} />
            <h2
              className="text-sm uppercase tracking-widest font-semibold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-muted)', letterSpacing: '0.15em' }}
            >
              About
            </h2>
          </div>
          <p
            className="text-base sm:text-lg leading-loose max-w-3xl"
            style={{
              color: 'var(--text-secondary)',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.95',
            }}
          >
            {bio}
          </p>
        </GlassCard>

        {/* Skills */}
        <GlassCard className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, var(--purple), var(--pink))' }} />
            <h2
              className="text-sm uppercase tracking-widest font-semibold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-muted)', letterSpacing: '0.15em' }}
            >
              Skills & Technologies
            </h2>
          </div>

          {skillCategories.length > 1 ? (
            <div className="space-y-6">
              {skillCategories.map(({ label, items, color }, ci) => (
                <div key={label}>
                  <p
                    className="text-xs font-medium mb-3 uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((skill, i) => (
                      <NeonBadge key={skill} color={color}>
                        {skill}
                      </NeonBadge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <NeonBadge key={skill} color={i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'purple' : 'pink'}>
                  {skill}
                </NeonBadge>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
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
