import { createClient } from '@/lib/supabase/server'

// Same-origin copy of the avatar so client code can read its pixels (ASCII portrait)
// without depending on the image host's CORS policy.
export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('about').select('avatar_url').single()
    const url: string | undefined = data?.avatar_url
    if (!url || !/^https:\/\//.test(url)) return new Response('No avatar', { status: 404 })

    const upstream = await fetch(url)
    const type = upstream.headers.get('content-type') ?? ''
    if (!upstream.ok || !type.startsWith('image/')) {
      console.error('[avatar] upstream failed', upstream.status, type)
      return new Response('Avatar unavailable', { status: 502 })
    }
    return new Response(upstream.body, {
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch (err) {
    console.error('[avatar] failed', err)
    return new Response('Avatar unavailable', { status: 502 })
  }
}
