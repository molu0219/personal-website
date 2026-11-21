/** A shell prompt + its output: the page's section header pattern on /about. */
export default function TerminalBlock({
  command,
  children,
  id,
}: {
  command: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className="py-12 border-t" style={{ borderColor: 'var(--border)' }}>
      <h2 className="mb-6 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--accent)' }}>joey@chen</span>
        <span style={{ color: 'var(--text-muted)' }}>:~$ </span>
        <span style={{ color: 'var(--text-primary)' }}>{command}</span>
      </h2>
      {children}
    </section>
  )
}
