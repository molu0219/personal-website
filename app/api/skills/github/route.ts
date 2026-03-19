import { NextRequest } from 'next/server'
import { isAuthorized, unauthorizedResponse } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse()

  const { url } = await req.json()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })

  // Parse GitHub URL → owner/repo
  const match = url.match(/github\.com\/([^/]+)\/([^/\s#?]+)/)
  if (!match) return Response.json({ error: 'Invalid GitHub URL' }, { status: 400 })

  const owner = match[1]
  const repo = match[2].replace(/\.git$/, '')

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })

    if (!res.ok) return Response.json({ error: 'Repository not found' }, { status: 404 })

    const data = await res.json()

    return Response.json({
      data: {
        name: data.name,
        description: data.description ?? '',
        stars: data.stargazers_count ?? 0,
        forks: data.forks_count ?? 0,
        repo_url: data.html_url,
      },
    })
  } catch {
    return Response.json({ error: 'Failed to fetch repository info' }, { status: 500 })
  }
}
