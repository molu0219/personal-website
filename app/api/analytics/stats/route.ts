import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const supabase = createServiceClient()
  const now = new Date()

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const week = new Date(now)
  week.setDate(week.getDate() - 7)

  const month = new Date(now)
  month.setDate(month.getDate() - 30)

  const [
    { count: todayCount },
    { count: weekCount },
    { count: monthCount },
    { count: totalCount },
    { data: dailyRaw },
    { data: topPages },
    { data: topReferrers },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', week.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', month.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('created_at').gte('created_at', month.toISOString()).order('created_at', { ascending: true }),
    supabase.from('page_views').select('path').gte('created_at', month.toISOString()),
    supabase.from('page_views').select('referrer').gte('created_at', month.toISOString()).not('referrer', 'is', null),
  ])

  // Group daily views by date
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyMap[key] = 0
  }
  for (const row of dailyRaw ?? []) {
    const key = row.created_at.slice(0, 10)
    if (key in dailyMap) dailyMap[key]++
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  // Top pages
  const pageCount: Record<string, number> = {}
  for (const row of topPages ?? []) {
    pageCount[row.path] = (pageCount[row.path] ?? 0) + 1
  }
  const pages = Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }))

  // Top referrers
  const refCount: Record<string, number> = {}
  for (const row of topReferrers ?? []) {
    if (!row.referrer) continue
    try {
      const host = new URL(row.referrer).hostname
      refCount[host] = (refCount[host] ?? 0) + 1
    } catch {
      refCount[row.referrer] = (refCount[row.referrer] ?? 0) + 1
    }
  }
  const referrers = Object.entries(refCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }))

  return Response.json({
    summary: {
      today: todayCount ?? 0,
      week: weekCount ?? 0,
      month: monthCount ?? 0,
      total: totalCount ?? 0,
    },
    daily,
    pages,
    referrers,
  })
}
