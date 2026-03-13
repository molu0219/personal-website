import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = isAuthorized(req) ? createServiceClient() : await createClient()

  let query = supabase.from('projects').select('*').eq('id', id)
  if (!isAuthorized(req)) query = query.eq('published', true)

  const { data, error } = await query.single()
  if (error) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ data })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return unauthorizedResponse()
  const { id } = await params
  const body = await req.json()

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) return unauthorizedResponse()
  const { id } = await params

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ success: true })
}
