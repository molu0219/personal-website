import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = isAuthorized(req) ? createServiceClient() : await createClient()
  const { data, error } = await supabase.from('about').select('*').single()
  if (error) return Response.json({ data: null })
  return Response.json({ data })
}

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const body = await req.json()
  const supabase = createServiceClient()

  const { data: existing } = await supabase.from('about').select('id').single()

  let result
  if (existing?.id) {
    result = await supabase
      .from('about')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabase.from('about').insert(body).select().single()
  }

  if (result.error) return Response.json({ error: result.error.message }, { status: 400 })
  return Response.json({ data: result.data })
}
