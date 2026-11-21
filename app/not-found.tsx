import type { Metadata } from 'next'
import AsciiKnot from '@/components/art/AsciiKnot'
import NeonButton from '@/components/ui/NeonButton'

export const metadata: Metadata = { title: 'Not found — Joey Chen', robots: { index: false } }

export default function NotFound() {
  return (
    <section className="px-6 pt-32 pb-16 md:pt-40">
      <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <p className="text-xs mb-4" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            $ cd ./this-page
          </p>
          <h1
            className="text-5xl md:text-7xl font-medium tracking-[-0.03em] leading-[1.02]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            404<span style={{ color: 'var(--accent)' }}>.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            No such file or directory. The page may have moved — Skills and the Cheat Sheet were retired.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <NeonButton href="/" variant="cyan">Back home</NeonButton>
            <NeonButton href="/blog" variant="purple">Read the blog</NeonButton>
          </div>
        </div>
        <AsciiKnot shape={{ p: 3, q: 7 }} speed={0.8} className="h-[300px] md:h-[440px]" />
      </div>
    </section>
  )
}
