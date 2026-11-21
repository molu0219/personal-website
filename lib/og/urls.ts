// Client-safe URL helpers for generated images (no server imports here).

/** Stable public URL of a project's generated cover. */
export const projectCoverUrl = (slug: string) => `/og/projects/${encodeURIComponent(slug)}`

/** Stable public URL of a post's generated cover (the file-convention route has a build hash). */
export const postCoverUrl = (slug: string) => `/og/blog/${encodeURIComponent(slug)}`
