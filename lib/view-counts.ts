import { createServiceClient } from '@/lib/supabase/server'

export async function getViewCounts(paths: string[]): Promise<Record<string, number>> {
  if (paths.length === 0) return {}

  const supabase = createServiceClient()
  const results = await Promise.all(
    paths.map(async (path) => {
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('path', path)
      return [path, count ?? 0] as const
    })
  )
  return Object.fromEntries(results)
}

export async function getViewCount(path: string): Promise<number> {
  const supabase = createServiceClient()
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('path', path)
  return count ?? 0
}
