import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const supabase = createServiceClient()
  const { data: skills, error } = await supabase.from('skills').select('id, repo_url')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!skills || skills.length === 0) return Response.json({ updated: 0 })

  let updated = 0

  for (const skill of skills) {
    const match = skill.repo_url?.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
    if (!match) continue

    const owner = match[1]
    const repo = match[2].replace(/\.git$/, '')

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      })

      if (!res.ok) continue

      const data = await res.json()

      await supabase
        .from('skills')
        .update({
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', skill.id)

      updated++
    } catch {
      // Skip failed fetches
    }
  }

  return Response.json({ updated })
}
