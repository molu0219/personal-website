import type { Metadata } from 'next'
import CheatSheet from '@/components/cheatsheet/CheatSheet'

export const metadata: Metadata = {
  title: 'Cheat Sheet — Joey Chen',
  description: 'Complete reference for Claude Code commands, keyboard shortcuts, CLI flags, and configuration.',
  alternates: { canonical: '/cheatsheet' },
}

export default function CheatSheetPage() {
  return (
    <div className="relative z-10 min-h-screen px-6 pt-32 pb-20 max-w-[1600px] mx-auto">
      <div className="mb-10">
        <p
          className="font-mono uppercase text-xs mb-4"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
        >
          Reference
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Cheat <span className="gradient-text">Sheet</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Commands, shortcuts, CLI flags &amp; configuration — all in one place.
        </p>
      </div>
      <CheatSheet />
    </div>
  )
}
