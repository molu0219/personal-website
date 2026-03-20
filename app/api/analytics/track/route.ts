import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = process.env.HASH_SALT ?? ''
  const data = encoder.encode(ip + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

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

    // Get visitor hash from IP
    const ip = req.headers.get('cf-connecting-ip')
      ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? 'unknown'
    const visitorHash = await hashIP(ip)

    const supabase = createServiceClient()
    await supabase.from('page_views').insert({
      path,
      referrer: referrer || null,
      user_agent: req.headers.get('user-agent') || null,
      visitor_hash: visitorHash,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: true }) // fail silently
  }
}
