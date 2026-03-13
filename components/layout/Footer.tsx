import { createClient } from '@/lib/supabase/server'
import FooterClient from './FooterClient'

export default async function Footer() {
  let socials: Record<string, string> = {}

  try {
    const supabase = await createClient()
    const { data } = await supabase.from('about').select('social_links').single()
    socials = data?.social_links ?? {}
  } catch {}

  return <FooterClient socials={socials} />
}
