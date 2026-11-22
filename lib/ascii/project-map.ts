import { pickMotif, type Motif } from '@/lib/ascii/motifs'
import { hashString, rng } from '@/lib/ascii/noise'

/** Projects laid out as a star map: topic clusters, nodes around them, edges for shared tags. */

export type ClusterKey = 'trading' | 'chain' | 'ai' | '3d' | 'tools' | 'misc'

export const CLUSTER_LABEL: Record<ClusterKey, string> = {
  trading: 'TRADING',
  chain: 'CHAIN',
  ai: 'AI',
  '3d': '3D',
  tools: 'TOOLS',
  misc: 'MISC',
}

const MOTIF_CLUSTER: Record<Motif, ClusterKey> = {
  candles: 'trading',
  odds: 'trading',
  chain: 'chain',
  network: 'ai',
  bars: 'ai',
  orb: '3d',
  commits: 'tools',
  terminal: 'tools',
  pipeline: 'tools',
  layers: 'tools',
  radar: 'tools',
  landscape: 'misc',
}

/** Node glyph per motif, so the map itself hints at each project's subject. */
export const MOTIF_GLYPH: Record<Motif, string> = {
  candles: '|#|',
  odds: '/~\\',
  chain: '[#]',
  network: '(o)',
  bars: '|||',
  orb: '(@)',
  commits: 'o-o',
  terminal: '[$]',
  pipeline: '=>',
  layers: '[=]',
  radar: '(+)',
  landscape: '/\\',
}

export interface MapProject {
  slug: string
  tags?: string[] | null
}

export interface MapNode {
  slug: string
  motif: Motif
  cluster: ClusterKey
  /** Position in % of the map box. */
  x: number
  y: number
}

export interface MapCluster {
  key: ClusterKey
  label: string
  x: number
  y: number
  count: number
}

export interface ProjectMapLayout {
  nodes: MapNode[]
  clusters: MapCluster[]
  /** Index pairs into `nodes`, plus the tags they share. */
  edges: { a: number; b: number; tags: string[] }[]
}

// Fixed spots for clusters (in % of the box) so the map reads the same on every visit.
// One horizontal band, labels alternating low/high so neighbouring clusters never collide.
const SPOTS: [number, number][] = [
  [11, 72],
  [30, 40],
  [50, 72],
  [70, 40],
  [89, 72],
  [50, 16],
]

export function layoutProjectMap(projects: MapProject[]): ProjectMapLayout {
  const byCluster = new Map<ClusterKey, MapProject[]>()
  const motifOf = new Map<string, Motif>()
  for (const p of projects) {
    const motif = pickMotif(p.slug, p.tags)
    motifOf.set(p.slug, motif)
    const key = MOTIF_CLUSTER[motif]
    byCluster.set(key, [...(byCluster.get(key) ?? []), p])
  }
  // Biggest clusters get the corner spots first.
  const ordered = Array.from(byCluster.entries()).sort((a, b) => b[1].length - a[1].length)
  const clusters: MapCluster[] = []
  const nodes: MapNode[] = []
  ordered.forEach(([key, members], i) => {
    const [cx, cy] = SPOTS[i % SPOTS.length]
    clusters.push({ key, label: CLUSTER_LABEL[key], x: cx, y: cy, count: members.length })
    members.forEach((p, j) => {
      const rand = rng(hashString(p.slug))
      // Members sit side by side just above (low labels) or below (high labels) their cluster label.
      const spread = (j - (members.length - 1) / 2) * 9 + (rand() - 0.5) * 1.5
      const dy = cy > 50 ? -30 : 30
      nodes.push({
        slug: p.slug,
        motif: motifOf.get(p.slug)!,
        cluster: key,
        x: Math.min(92, Math.max(8, cx + spread)),
        y: Math.min(86, Math.max(14, cy + dy)),
      })
    })
  })
  const tagsOf = (slug: string) =>
    new Set((projects.find(p => p.slug === slug)?.tags ?? []).map(t => t.toLowerCase()))
  const edges: ProjectMapLayout['edges'] = []
  for (let a = 0; a < nodes.length; a++)
    for (let b = a + 1; b < nodes.length; b++) {
      const ta = tagsOf(nodes[a].slug)
      const shared = Array.from(tagsOf(nodes[b].slug)).filter(t => ta.has(t))
      if (shared.length) edges.push({ a, b, tags: shared })
    }
  return { nodes, clusters, edges }
}
