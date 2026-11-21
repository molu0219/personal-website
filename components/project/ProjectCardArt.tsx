import AsciiFingerprint from '@/components/art/AsciiFingerprint'

/** Fingerprint sized for a project card's 16:10 preview. */
export default function ProjectCardArt({ content }: { content: string }) {
  return (
    <AsciiFingerprint
      content={content}
      cols={72}
      maxRows={26}
      className="text-[7px] leading-[9px] md:text-[8px] md:leading-[10px]"
    />
  )
}

/** Build slug → art for a list of projects, dropping their markdown from what goes to the client. */
export function splitProjectArt<T extends { slug: string; content?: string | null }>(rows: T[]) {
  const arts: Record<string, React.ReactNode> = {}
  const projects = rows.map(({ content, ...rest }) => {
    if (content) arts[rest.slug] = <ProjectCardArt content={content} />
    return rest
  })
  return { projects, arts }
}
