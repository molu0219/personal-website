import { createClient } from '@/lib/supabase/server'
import type { MetadataRoute } from 'next'

const BASE_URL = 'https://0xjoeytw.xyz'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/skills`, changeFrequency: 'weekly', priority: 0.7 },
  ]

  try {
    const supabase = await createClient()

    const [{ data: posts }, { data: projects }] = await Promise.all([
      supabase
        .from('posts')
        .select('slug, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false }),
      supabase
        .from('projects')
        .select('slug, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false }),
    ])

    for (const post of posts ?? []) {
      entries.push({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.published_at ?? undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }

    for (const project of projects ?? []) {
      entries.push({
        url: `${BASE_URL}/projects/${project.slug}`,
        lastModified: project.created_at ?? undefined,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch {}

  return entries
}
