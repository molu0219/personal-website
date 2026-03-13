import { NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

  const service = createServiceClient()
  const ext = file.name.split('.').pop()
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await service.storage
    .from('media')
    .upload(path, await file.arrayBuffer(), { contentType: file.type })

  if (error) return Response.json({ error: error.message }, { status: 400 })

  const { data: { publicUrl } } = service.storage.from('media').getPublicUrl(path)
  return Response.json({ url: publicUrl }, { status: 201 })
}
