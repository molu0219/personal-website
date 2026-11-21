import AsciiArt from '@/components/art/AsciiArt'
import { landscape } from '@/lib/ascii/landscape'

/** Generated landscape sized for a project card's 16:10 preview. */
export default function ProjectCardArt({ content, seed, tags }: { content: string; seed: string; tags?: string[] | null }) {
  return (
    <div className="flex h-full items-center justify-center">
      <AsciiArt grid={landscape({ content, seed, tags }, 92, 30)} className="text-[6px] leading-[7px]" />
    </div>
  )
}

/** Build slug → art for a list of projects, dropping their markdown from what goes to the client. */
export function splitProjectArt<T extends { slug: string; content?: string | null; tags?: string[] | null }>(rows: T[]) {
  const arts: Record<string, React.ReactNode> = {}
  const projects = rows.map(({ content, ...rest }) => {
    arts[rest.slug] = <ProjectCardArt content={content ?? ''} seed={rest.slug} tags={rest.tags} />
    return rest
  })
  return { projects, arts }
}
