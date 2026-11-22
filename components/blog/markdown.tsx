import type { Components } from 'react-markdown'

/**
 * The page already renders the title as its single <h1>; a leading "# Title" in the
 * markdown body would add a second one. Demote body h1s to h2 (one h1 per page).
 */
export const MARKDOWN_COMPONENTS: Components = {
  // `node` is react-markdown's AST node; keep it off the DOM element.
  h1: ({ node, ...props }) => {
    void node
    return <h2 {...props} />
  },
}
