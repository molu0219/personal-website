import { renderProjectCover } from '@/lib/og/project-cover'

// Stable cover URL for JSON-LD.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (await renderProjectCover(slug)) ?? new Response('Not found', { status: 404 })
}
