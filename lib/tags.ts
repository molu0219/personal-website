/** Canonical tag form: lowercase, whitespace → "-", de-duplicated ("Claude Code" and "claude-code" are one tag). */
export function normalizeTags(tags: unknown): string[] | undefined {
  if (!Array.isArray(tags)) return undefined
  const out = tags
    .filter((t): t is string => typeof t === 'string')
    .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
    .filter(Boolean)
  return Array.from(new Set(out))
}
