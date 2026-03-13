import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = isAuthorized(req) ? createServiceClient() : await createClient()
  const showDrafts = isAuthorized(req)

  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (!showDrafts) query = query.eq('published', true)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const body = await req.json()
  const supabase = createServiceClient()
  const { data, error } = await supabase.from('projects').insert(body).select().single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ data }, { status: 201 })
}
