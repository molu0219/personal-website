import Image from './opengraph-image'

export { alt, size, contentType } from './opengraph-image'
// Route segment config must be declared here directly (re-exports aren't read): render per request.
export const dynamic = 'force-dynamic'
export default Image
