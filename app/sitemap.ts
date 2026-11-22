import { unstable_rethrow } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://0xjoeytw.xyz'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'weekly', priority: 0.9 },
  ]

  try {
    const supabase = await createClient()

    const [{ data: posts }, { data: projects }] = await Promise.all([
      supabase
        .from('posts')
        .select('slug, published_at, updated_at')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      supabase
        .from('projects')
        .select('slug, created_at, updated_at')
        .eq('published', true)
        .order('created_at', { ascending: false }),
    ])

    for (const post of posts ?? []) {
      entries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at ?? post.published_at ?? undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    for (const project of projects ?? []) {
      entries.push({
        url: `${BASE_URL}/projects/${project.slug}`,
        lastModified: project.updated_at ?? project.created_at ?? undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
    // Index pages change whenever their newest item does.
    const newest = (rows: { updated_at?: string | null; published_at?: string | null; created_at?: string | null }[] | null) =>
      (rows ?? []).map(r => r.updated_at ?? r.published_at ?? r.created_at ?? '').sort().at(-1) || undefined
    const blogMod = newest(posts)
    const projMod = newest(projects)
    const siteMod = [blogMod, projMod].filter(Boolean).sort().at(-1)
    entries[0].lastModified = siteMod
    entries[2].lastModified = blogMod
    entries[3].lastModified = projMod
    entries[1].lastModified = siteMod
  } catch (err) {
    unstable_rethrow(err)
    console.error('[sitemap] failed to load content', err)
  }

  return entries
}
