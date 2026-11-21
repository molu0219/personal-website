import { renderProjectCover } from '@/lib/og/project-cover'

// Stable cover URL for JSON-LD and in-page images.
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const variant = new URL(req.url).searchParams.get('variant') === 'art' ? 'art' : 'full'
  return (await renderProjectCover(slug, variant)) ?? new Response('Not found', { status: 404 })
}
