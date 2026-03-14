import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = await req.json()
    if (!path || typeof path !== 'string') {
      return Response.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Skip admin routes
    if (path.startsWith('/admin')) {
      return Response.json({ ok: true })
    }

    const supabase = createServiceClient()
    await supabase.from('page_views').insert({
      path,
      referrer: referrer || null,
      user_agent: req.headers.get('user-agent') || null,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true }) // fail silently
  }
}
