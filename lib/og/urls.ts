// Client-safe URL helpers for generated images (no server imports here).

/** Stable public URL of a post's generated cover (the file-convention route has a build hash). */
export const postCoverUrl = (slug: string, variant: 'full' | 'art' = 'full') =>
  `/og/blog/${encodeURIComponent(slug)}${variant === 'art' ? '?variant=art' : ''}`
