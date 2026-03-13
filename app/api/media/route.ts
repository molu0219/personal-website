import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const supabase = createServiceClient()
  const ext = file.name.split('.').pop()
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('media')
    .upload(path, await file.arrayBuffer(), { contentType: file.type })

  if (error) return Response.json({ error: error.message }, { status: 400 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

  return Response.json({ url: publicUrl }, { status: 201 })
}
