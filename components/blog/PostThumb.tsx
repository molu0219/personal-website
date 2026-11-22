import AsciiArt from '@/components/art/AsciiArt'
import { contentArt } from '@/lib/ascii/motifs'

/** Small version of a post's generated landscape, for list rows. */
export function PostThumb({ content, seed, tags }: { content: string; seed: string; tags?: string[] | null }) {
  return (
    <div
      className="ascii-dark overflow-hidden rounded-md border"
      style={{ borderColor: '#232323', background: '#0a0a0a' }}
    >
      <AsciiArt grid={contentArt({ content, seed, tags }, 64, 20)} className="text-[3px] leading-[3.6px]" />
    </div>
  )
}

/** slug → thumbnail, rendered on the server so markdown never reaches the client. */
export function postThumbs(rows: { slug: string; content?: string | null; tags?: string[] | null }[]) {
  const out: Record<string, React.ReactNode> = {}
  for (const r of rows) out[r.slug] = <PostThumb content={r.content ?? ''} seed={r.slug} tags={r.tags} />
  return out
}
