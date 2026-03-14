import GlassCard from '@/components/ui/GlassCard'
import { createServiceClient } from '@/lib/supabase/server'

async function getStats() {
  const supabase = createServiceClient()
  const now = new Date()

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const week = new Date(now); week.setDate(week.getDate() - 7)
  const month = new Date(now); month.setDate(month.getDate() - 30)

  const [
    { count: todayCount },
    { count: weekCount },
    { count: monthCount },
    { count: totalCount },
    { data: dailyRaw },
    { data: allPages },
    { data: allRefs },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', week.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', month.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('created_at').gte('created_at', month.toISOString()),
    supabase.from('page_views').select('path').gte('created_at', month.toISOString()),
    supabase.from('page_views').select('referrer').gte('created_at', month.toISOString()).not('referrer', 'is', null),
  ])

  // Daily views last 30 days
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of dailyRaw ?? []) {
    const key = row.created_at.slice(0, 10)
    if (key in dailyMap) dailyMap[key]++
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  // Top pages
  const pageCount: Record<string, number> = {}
  for (const row of allPages ?? []) pageCount[row.path] = (pageCount[row.path] ?? 0) + 1
  const pages = Object.entries(pageCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, count]) => ({ path, count }))

  // Top referrers
  const refCount: Record<string, number> = {}
  for (const row of allRefs ?? []) {
    if (!row.referrer) continue
    try { const h = new URL(row.referrer).hostname; refCount[h] = (refCount[h] ?? 0) + 1 }
    catch { refCount[row.referrer] = (refCount[row.referrer] ?? 0) + 1 }
  }
  const referrers = Object.entries(refCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([source, count]) => ({ source, count }))

  return {
    summary: { today: todayCount ?? 0, week: weekCount ?? 0, month: monthCount ?? 0, total: totalCount ?? 0 },
    daily,
    pages,
    referrers,
  }
}

export default async function AnalyticsPage() {
  let stats
  try { stats = await getStats() } catch { stats = null }

  if (!stats) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Analytics</h1>
        <GlassCard className="p-6">
          <p style={{ color: 'var(--text-muted)' }}>無法載入分析資料。請確認 Supabase page_views 資料表已建立。</p>
        </GlassCard>
      </div>
    )
  }

  const maxDaily = Math.max(...stats.daily.map(d => d.count), 1)
  const maxPage = Math.max(...stats.pages.map(p => p.count), 1)
  const maxRef = Math.max(...stats.referrers.map(r => r.count), 1)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
        Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '今日瀏覽', value: stats.summary.today, color: 'var(--cyan)' },
          { label: '近 7 天', value: stats.summary.week, color: 'var(--cyan)' },
          { label: '近 30 天', value: stats.summary.month, color: 'var(--purple)' },
          { label: '全部總計', value: stats.summary.total, color: 'var(--purple)' },
        ].map(s => (
          <GlassCard key={s.label} className="p-6 text-center">
            <div className="text-3xl font-bold mb-1" style={{ color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>
              {s.value.toLocaleString()}
            </div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Daily Chart */}
      <GlassCard className="p-6 mb-6">
        <h2 className="font-semibold mb-5 text-sm" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          PAGE VIEWS — LAST 30 DAYS
        </h2>
        <div className="flex items-end gap-[3px] h-32">
          {stats.daily.map(({ date, count }) => {
            const heightPct = maxDaily === 0 ? 0 : Math.round((count / maxDaily) * 100)
            const isToday = date === new Date().toISOString().slice(0, 10)
            return (
              <div
                key={date}
                className="flex-1 flex flex-col items-center justify-end group relative"
                style={{ height: '100%' }}
              >
                <div
                  className="w-full rounded-sm transition-opacity"
                  style={{
                    height: `${Math.max(heightPct, count > 0 ? 4 : 1)}%`,
                    background: isToday ? 'var(--cyan)' : 'var(--purple)',
                    opacity: count === 0 ? 0.2 : 0.85,
                  }}
                />
                {/* Tooltip */}
                <div
                  className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap rounded px-2 py-1 text-xs"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  {date.slice(5)}: {count}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{stats.daily[0]?.date.slice(5)}</span>
          <span>{stats.daily[stats.daily.length - 1]?.date.slice(5)}</span>
        </div>
      </GlassCard>

      {/* Top Pages + Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            TOP PAGES (30d)
          </h2>
          {stats.pages.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>尚無資料</p>
          ) : (
            <div className="space-y-3">
              {stats.pages.map(({ path, count }) => (
                <div key={path}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate" style={{ color: 'var(--text-primary)', maxWidth: '75%' }}>{path}</span>
                    <span style={{ color: 'var(--cyan)' }}>{count}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${(count / maxPage) * 100}%`, background: 'var(--cyan)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            TOP REFERRERS (30d)
          </h2>
          {stats.referrers.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>尚無外部來源</p>
          ) : (
            <div className="space-y-3">
              {stats.referrers.map(({ source, count }) => (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate" style={{ color: 'var(--text-primary)', maxWidth: '75%' }}>{source}</span>
                    <span style={{ color: 'var(--purple)' }}>{count}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${(count / maxRef) * 100}%`, background: 'var(--purple)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
