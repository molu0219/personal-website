import type { Metadata } from 'next'
import CheatSheet from '@/components/cheatsheet/CheatSheet'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Cheat Sheet — Joey Chen',
  description: 'Complete reference for Claude Code commands, keyboard shortcuts, CLI flags, and configuration.',
  alternates: { canonical: '/cheatsheet' },
}

export default function CheatSheetPage() {
  return (
    <div className="px-6 pb-24 max-w-[1400px] mx-auto">
      <PageHeader
        eyebrow="~/cheatsheet"
        title="Claude Code Cheat Sheet"
        description="Commands, shortcuts, CLI flags & configuration — all in one place."
      />
      <div className="pt-10" />
      <CheatSheet />
    </div>
  )
}
