import { renderPostCover } from '@/lib/og/post-cover'

// Stable cover URL for JSON-LD and in-page thumbnails.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (await renderPostCover(slug)) ?? new Response('Not found', { status: 404 })
}
