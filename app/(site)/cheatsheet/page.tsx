import type { Metadata } from 'next'
import CheatSheet from '@/components/cheatsheet/CheatSheet'

export const metadata: Metadata = {
  title: 'Claude Code Cheat Sheet — Joey Chen',
  description: 'Complete reference for Claude Code commands, keyboard shortcuts, CLI flags, and configuration.',
  alternates: { canonical: '/cheatsheet' },
}

export default function CheatSheetPage() {
  return (
    <div className="relative z-10 min-h-screen px-4 pt-28 pb-20 max-w-[1600px] mx-auto">
      <div className="text-center mb-8">
        <p
          className="font-mono uppercase text-xs mb-3"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.25em' }}
        >
          Reference
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Claude Code Cheat Sheet
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Commands, shortcuts, CLI flags &amp; configuration — all in one place
        </p>
      </div>
      <CheatSheet />
    </div>
  )
}
