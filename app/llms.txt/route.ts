import { createClient } from '@/lib/supabase/server'

const BASE = 'https://0xjoeytw.xyz'

interface Row {
  slug: string
  title: string
  excerpt?: string | null
  description?: string | null
}

const line = (path: string, r: Row) =>
  `- [${r.title}](${BASE}/${path}/${r.slug})${r.excerpt || r.description ? `: ${(r.excerpt ?? r.description ?? '').replace(/\s+/g, ' ').trim()}` : ''}`

// Generated from the database so new posts and projects are listed automatically (llmstxt.org format).
export async function GET() {
  let posts: Row[] = []
  let projects: Row[] = []
  try {
    const supabase = await createClient()
    const [p, j] = await Promise.all([
      supabase.from('posts').select('slug,title,excerpt').eq('published', true).order('published_at', { ascending: false }),
      supabase.from('projects').select('slug,title,description').eq('published', true).order('created_at', { ascending: false }),
    ])
    if (p.error || j.error) console.error('[llms.txt] query failed', p.error?.message ?? j.error?.message)
    posts = p.data ?? []
    projects = j.data ?? []
  } catch (err) {
    console.error('[llms.txt] failed to load content', err)
  }

  const body = [
    '# Joey Chen',
    '',
    '> Joey Chen（0xjoeytw）的個人網站：AI agent 開發工作流、Claude Code 實戰筆記，以及交易與區塊鏈工具的作品。Articles are written in Traditional Chinese.',
    '',
    '## About',
    `- [About Joey Chen](${BASE}/about): Background, skills and links`,
    '',
    '## Blog Posts',
    ...posts.map(r => line('blog', r)),
    '',
    '## Projects',
    ...projects.map(r => line('projects', r)),
    '',
    '## Optional',
    `- [Sitemap](${BASE}/sitemap.xml)`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
