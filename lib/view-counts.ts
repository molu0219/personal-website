import { createServiceClient } from '@/lib/supabase/server'

export async function getViewCounts(paths: string[]): Promise<Record<string, number>> {
  if (paths.length === 0) return {}

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_views')
    .select('path')
    .in('path', paths)

  const counts: Record<string, number> = {}
  for (const path of paths) counts[path] = 0
  for (const row of data ?? []) {
    counts[row.path] = (counts[row.path] ?? 0) + 1
  }
  return counts
}

export async function getViewCount(path: string): Promise<number> {
  const supabase = createServiceClient()
  const { count } = await supabase
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .eq('path', path)
  return count ?? 0
}
