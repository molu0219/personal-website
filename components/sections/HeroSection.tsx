import AsciiKnot from '@/components/art/AsciiKnot'
import NeonButton from '@/components/ui/NeonButton'

interface Props {
  name?: string
  tagline?: string
  description?: string
  statusText?: string
  statusActive?: boolean
}

export default function HeroSection({
  name = 'Joey Chen',
  tagline = 'Blockchain Developer · Builder · Creator',
  description = 'I build decentralized applications, explore on-chain analytics, and create generative art experiences at the intersection of code and creativity.',
  statusText = 'Available for opportunities',
  statusActive = true,
}: Props) {
  return (
    <section className="relative px-6 pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div className="order-2 md:order-1">
          {statusActive && statusText && (
            <p
              className="inline-flex items-center gap-2 mb-8 text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              {statusText}
            </p>
          )}

          <h1
            className="text-5xl md:text-7xl font-medium leading-[1.02] tracking-[-0.03em] mb-6"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {name}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </h1>

          <p
            className="text-sm mb-5"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
          >
            {tagline}
          </p>

          <p className="text-base md:text-lg leading-relaxed max-w-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <NeonButton href="/projects" variant="cyan">View projects</NeonButton>
            <NeonButton href="/blog" variant="purple">Read the blog</NeonButton>
          </div>
        </div>

        <AsciiKnot className="order-1 md:order-2 h-[280px] sm:h-[360px] md:h-[480px]" />
      </div>
    </section>
  )
}
