import GlassCard from '@/components/ui/GlassCard'
import { createServiceClient } from '@/lib/supabase/server'
import ContentTabs from './ContentTabs'

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDevice(ua: string | null): 'Mobile' | 'Desktop' {
  if (!ua) return 'Desktop'
  return /Mobile|Android|iPhone|iPad|iPod/i.test(ua) ? 'Mobile' : 'Desktop'
}

function parseBrowser(ua: string | null): string {
  if (!ua) return 'Unknown'
  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\//i.test(ua)) return 'Opera'
  if (/Chrome/i.test(ua)) return 'Chrome'
  if (/Firefox/i.test(ua)) return 'Firefox'
  if (/Safari/i.test(ua)) return 'Safari'
  return 'Other'
}

function pageLabel(path: string): string {
  if (path === '/') return 'Home'
  if (path === '/about') return 'About'
  if (path === '/blog') return 'Blog Index'
  if (path === '/projects') return 'Projects Index'
  if (path.startsWith('/blog/')) return path.replace('/blog/', '').replace(/-/g, ' ')
  if (path.startsWith('/projects/')) return path.replace('/projects/', '').replace(/-/g, ' ')
  return path
}

function pctChange(current: number, prev: number): number | null {
  if (prev === 0) return null
  return Math.round(((current - prev) / prev) * 100)
}

// ── data fetching ─────────────────────────────────────────────────────────────

async function getStats() {
  const supabase = createServiceClient()
  const now = new Date()

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const yesterday = new Date(todayStart); yesterday.setDate(yesterday.getDate() - 1)
  const d7 = new Date(now); d7.setDate(d7.getDate() - 7)
  const d14 = new Date(now); d14.setDate(d14.getDate() - 14)
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30)
  const d60 = new Date(now); d60.setDate(d60.getDate() - 60)

  const [
    { count: today },
    { count: yesterday_ },
    { count: week },
    { count: prevWeek },
    { count: month },
    { count: prevMonth },
    { count: total },
    { data: dailyRaw },
    { data: allRows },
    { data: recent },
  ] = await Promise.all([
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', yesterday.toISOString()).lt('created_at', todayStart.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', d7.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', d14.toISOString()).lt('created_at', d7.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', d30.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()),
    supabase.from('page_views').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('created_at').gte('created_at', d30.toISOString()),
    supabase.from('page_views').select('path, referrer, user_agent').gte('created_at', d30.toISOString()),
    supabase.from('page_views').select('path, referrer, user_agent, created_at').order('created_at', { ascending: false }).limit(25),
  ])

  // daily chart (30d)
  const dailyMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const row of dailyRaw ?? []) {
    const k = row.created_at.slice(0, 10)
    if (k in dailyMap) dailyMap[k]++
  }
  const daily = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  // pages breakdown
  const pageCount: Record<string, number> = {}
  const deviceCount = { Mobile: 0, Desktop: 0 }
  const browserCount: Record<string, number> = {}
  const refCount: Record<string, number> = {}

  for (const row of allRows ?? []) {
    pageCount[row.path] = (pageCount[row.path] ?? 0) + 1
    const dev = parseDevice(row.user_agent)
    deviceCount[dev]++
    const br = parseBrowser(row.user_agent)
    browserCount[br] = (browserCount[br] ?? 0) + 1
    if (row.referrer) {
      try { const h = new URL(row.referrer).hostname; refCount[h] = (refCount[h] ?? 0) + 1 }
      catch { refCount[row.referrer] = (refCount[row.referrer] ?? 0) + 1 }
    }
  }

  const sortedPages = Object.entries(pageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([path, count]) => ({ path, count, label: pageLabel(path) }))

  return {
    summary: {
      today: today ?? 0,
      yesterday: yesterday_ ?? 0,
      week: week ?? 0,
      prevWeek: prevWeek ?? 0,
      month: month ?? 0,
      prevMonth: prevMonth ?? 0,
      total: total ?? 0,
      uniquePages: Object.keys(pageCount).length,
    },
    daily,
    pages: {
      all: sortedPages,
      blogs: sortedPages.filter(p => p.path.startsWith('/blog/') || p.path === '/blog'),
      projects: sortedPages.filter(p => p.path.startsWith('/projects/') || p.path === '/projects'),
    },
    referrers: Object.entries(refCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([source, count]) => ({ source, count })),
    devices: deviceCount,
    browsers: Object.entries(browserCount).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count })),
    recent: recent ?? [],
  }
}

// ── SVG line chart ────────────────────────────────────────────────────────────

function LineChart({ daily }: { daily: { date: string; count: number }[] }) {
  const W = 800, H = 100, PX = 0, PY = 8
  const max = Math.max(...daily.map(d => d.count), 1)

  const pts = daily.map((d, i) => ({
    x: PX + (i / (daily.length - 1)) * (W - PX * 2),
    y: H - PY - (d.count / max) * (H - PY * 2),
    ...d,
  }))

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`

  // x-axis labels: show every ~7 days
  const labelIdxs = [0, 6, 13, 20, 27, daily.length - 1]

  return (
    <div className="relative w-full" style={{ aspectRatio: '800/120' }}>
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = H - PY - f * (H - PY * 2)
          return (
            <line key={f} x1={0} y1={y} x2={W} y2={y}
              stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />
          )
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Today dot */}
        {pts.length > 0 && (
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3"
            fill="var(--cyan)" stroke="var(--bg)" strokeWidth="2" />
        )}
        {/* X-axis labels */}
        {labelIdxs.filter(i => i < pts.length).map(i => (
          <text key={i} x={pts[i].x} y={H + 16} textAnchor="middle"
            fontSize="9" fill="var(--text-muted)">{pts[i].date.slice(5)}</text>
        ))}
      </svg>
    </div>
  )
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, change, color, sub }: {
  label: string; value: number; change?: number | null; color: string; sub?: string
}) {
  return (
    <GlassCard className="p-5">
      <div className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div className="text-3xl font-bold" style={{ color, fontFamily: 'Space Grotesk, sans-serif' }}>
        {value.toLocaleString()}
      </div>
      <div className="flex items-center gap-2 mt-1.5">
        {change != null && (
          <span className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              background: change >= 0 ? 'rgba(0,255,136,0.12)' : 'rgba(255,80,80,0.12)',
              color: change >= 0 ? '#00ff88' : '#ff5050',
            }}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
        {sub && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </GlassCard>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  let stats
  try { stats = await getStats() } catch { stats = null }

  if (!stats) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>Analytics</h1>
        <GlassCard className="p-6">
          <p style={{ color: 'var(--text-muted)' }}>Unable to load analytics. Please ensure the Supabase <code>page_views</code> table exists.</p>
        </GlassCard>
      </div>
    )
  }

  const { summary, daily, pages, referrers, devices, browsers, recent } = stats
  const totalDevices = devices.Mobile + devices.Desktop || 1
  const maxBrowser = Math.max(...browsers.map(b => b.count), 1)
  const maxRef = Math.max(...referrers.map(r => r.count), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          Analytics
        </h1>
        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          Last 30 days
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="TODAY"
          value={summary.today}
          change={pctChange(summary.today, summary.yesterday)}
          sub="vs yesterday"
          color="var(--cyan)"
        />
        <StatCard
          label="THIS WEEK"
          value={summary.week}
          change={pctChange(summary.week, summary.prevWeek)}
          sub="vs prev week"
          color="var(--cyan)"
        />
        <StatCard
          label="THIS MONTH"
          value={summary.month}
          change={pctChange(summary.month, summary.prevMonth)}
          sub="vs prev month"
          color="var(--purple)"
        />
        <StatCard
          label="ALL TIME"
          value={summary.total}
          sub={`${summary.uniquePages} unique pages`}
          color="var(--purple)"
        />
      </div>

      {/* Line Chart */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            PAGE VIEWS — LAST 30 DAYS
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Peak: {Math.max(...daily.map(d => d.count))} views
          </span>
        </div>
        <LineChart daily={daily} />
      </GlassCard>

      {/* Content Tabs */}
      <ContentTabs all={pages.all} blogs={pages.blogs} projects={pages.projects} />

      {/* Referrers + Devices + Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Referrers */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            TOP REFERRERS
          </h2>
          {referrers.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No external referrers yet</p>
          ) : (
            <div className="space-y-3">
              {referrers.map(({ source, count }) => (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate text-xs" style={{ color: 'var(--text-primary)', maxWidth: '72%' }}>{source}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--purple)' }}>{count}</span>
                  </div>
                  <div className="h-0.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-0.5 rounded-full" style={{ width: `${(count / maxRef) * 100}%`, background: 'var(--purple)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Devices */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            DEVICES
          </h2>
          <div className="space-y-4">
            {(['Desktop', 'Mobile'] as const).map(d => (
              <div key={d}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: 'var(--text-primary)' }}>{d}</span>
                  <span className="text-xs font-mono" style={{ color: d === 'Desktop' ? 'var(--cyan)' : 'var(--pink)' }}>
                    {devices[d].toLocaleString()} ({((devices[d] / totalDevices) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(devices[d] / totalDevices) * 100}%`,
                      background: d === 'Desktop' ? 'var(--cyan)' : 'var(--pink)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-sm font-semibold mt-6 mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            BROWSERS
          </h2>
          <div className="space-y-2.5">
            {browsers.map(({ name, count }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                  <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{count}</span>
                </div>
                <div className="h-0.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-0.5 rounded-full" style={{ width: `${(count / maxBrowser) * 100}%`, background: 'var(--cyan)', opacity: 0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Activity */}
        <GlassCard className="p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            RECENT ACTIVITY
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No visits yet</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
              {recent.map((row: { path: string; referrer: string | null; user_agent: string | null; created_at: string }, i: number) => {
                const dt = new Date(row.created_at)
                const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const dateStr = dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
                const dev = parseDevice(row.user_agent)
                return (
                  <div key={i} className="flex items-start gap-2 py-1.5"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-base mt-0.5">{dev === 'Mobile' ? '📱' : '🖥️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {pageLabel(row.path)}
                      </div>
                      <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {row.referrer ? (() => { try { return new URL(row.referrer).hostname } catch { return row.referrer } })() : 'Direct'}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeStr}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{dateStr}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
