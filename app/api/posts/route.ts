import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeTags } from '@/lib/tags'

export async function GET(req: NextRequest) {
  const supabase = isAuthorized(req) ? createServiceClient() : await createClient()
  const showDrafts = isAuthorized(req)

  let query = supabase.from('posts').select('*').order('published_at', { ascending: false })
  if (!showDrafts) query = query.eq('published', true)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const body = await req.json()
  if ('tags' in body) body.tags = normalizeTags(body.tags) ?? []
  const supabase = createServiceClient()

  if (body.published && !body.published_at) {
    body.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from('posts').insert(body).select().single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ data }, { status: 201 })
}
