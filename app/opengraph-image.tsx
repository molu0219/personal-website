import { COVER_SIZE, renderCover } from '@/lib/og/cover'

export const alt = 'Joey Chen — AI agent workflows and on-chain tools'
export const size = COVER_SIZE
export const contentType = 'image/png'
// Render per request (on the edge, where the Google Fonts subset fetch works) instead of
// at build time, where a blocked font fetch would bake tofu into the image.
export const dynamic = 'force-dynamic'

// Site-wide card for pages without their own (home, about, blog and projects indexes).
export default function Image() {
  return renderCover({
    section: '~/',
    title: 'Joey Chen — AI agent 工作流與鏈上工具',
    meta: 'writing · projects · 0xjoeytw.xyz',
    path: '~/',
    content: '## Writing\n## Projects\n## AI agents\n## Claude Code\n## On-chain\n## About',
    seed: 'site-agent-network',
    tags: ['agent'],
  })
}
