import { COVER_SIZE } from '@/lib/og/cover'
import { renderFallbackCover, renderPostCover } from '@/lib/og/post-cover'

export const alt = 'Joey Chen — blog post'
export const size = COVER_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (await renderPostCover(slug)) ?? renderFallbackCover(slug)
}
