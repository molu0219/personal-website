import type { Metadata } from 'next'
import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignalHero from '@/components/sections/SignalHero'
import type { Signal } from '@/lib/ascii/signal-field'

export const metadata: Metadata = { title: 'Not found — Joey Chen', robots: { index: false } }

interface Row {
  slug: string
  title: string
}

// The missing page is lost in the noise; the lens still decodes everything that does exist.
export default async function NotFound() {
  let posts: Row[] = []
  let projects: Row[] = []
  try {
    const supabase = await createClient()
    const [{ data: b }, { data: p }] = await Promise.all([
      supabase.from('posts').select('slug,title').eq('published', true),
      supabase.from('projects').select('slug,title').eq('published', true),
    ])
    posts = b ?? []
    projects = p ?? []
  } catch (err) {
    unstable_rethrow(err)
    // The 404 must render even when the database is down.
    console.error('[404] failed to load signals', err)
  }

  const signals: Signal[] = [
    ...posts.map(p => ({ label: `~/blog/${p.slug}`, title: p.title, href: `/blog/${p.slug}` })),
    ...projects.map(p => ({ label: `~/projects/${p.slug}`, title: p.title, href: `/projects/${p.slug}` })),
  ]

  return (
    <SignalHero
      name="404"
      tagline="$ cd ./this-page — no such file or directory"
      description="This page isn't here (Skills and the Cheat Sheet were retired). Everything that does exist is hidden in the noise — move the cursor to decode it."
      signals={signals}
      stats={{ posts: posts.length, projects: projects.length, lastWrite: null }}
    />
  )
}
