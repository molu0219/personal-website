import { COVER_SIZE } from '@/lib/og/cover'
import { renderFallbackProjectCover, renderProjectCover } from '@/lib/og/project-cover'

export const alt = 'Joey Chen — project'
export const size = COVER_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (await renderProjectCover(slug)) ?? renderFallbackProjectCover(slug)
}
