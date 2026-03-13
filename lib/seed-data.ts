export const seedProjects = [
  {
    slug: 'defi-dashboard',
    title: 'OnChain Analytics Dashboard',
    description: 'A real-time DeFi portfolio tracker that aggregates positions across multiple chains, tracks PnL, and visualizes on-chain activity with interactive charts.',
    content: `## Overview

The OnChain Analytics Dashboard is a full-stack DeFi portfolio management tool built for serious on-chain participants. It connects to multiple blockchain networks and aggregates wallet positions into a single unified view.

## Key Features

- **Multi-chain support**: Ethereum, Arbitrum, Optimism, Base, and Polygon
- **Real-time pricing**: Price feeds via Chainlink oracles + CoinGecko API
- **PnL tracking**: Historical cost basis calculation with FIFO accounting
- **Protocol breakdown**: Identifies positions in Uniswap, Aave, Compound, etc.
- **Export**: Download transaction history as CSV

## Technical Architecture

The dashboard is built on Next.js App Router with server components for initial data fetching and client components for real-time updates.

### Data Pipeline

\`\`\`typescript
// Fetch portfolio across chains in parallel
const [ethPositions, arbPositions, opPositions] = await Promise.all([
  getPositions('ethereum', address),
  getPositions('arbitrum', address),
  getPositions('optimism', address),
])
\`\`\`

Data is stored in Supabase with row-level security, allowing users to save portfolios and set price alerts.

### Performance Optimizations

- ISR (Incremental Static Regeneration) for portfolio snapshots
- Edge caching for price data with 30s TTL
- WebSocket connections for live price ticks

## Challenges

The biggest challenge was normalizing position data across protocols. Each protocol returns different data structures, so I built a unified abstraction layer with adapters for each protocol.

## Results

The dashboard reduced the time to get a full portfolio overview from ~20 minutes (checking multiple sites manually) to under 5 seconds.`,
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Ethers.js', 'TailwindCSS'],
    featured: true,
    published: true,
    status: 'live',
  },
  {
    slug: 'dex-aggregator',
    title: 'DEX Aggregator Protocol',
    description: 'A smart contract-based DEX aggregator that finds optimal swap routes across Uniswap V3, Curve, Balancer, and 1inch, minimizing slippage and MEV exposure.',
    content: `## Overview

This DEX aggregator protocol routes trades through the most efficient path across major decentralized exchanges on Ethereum mainnet. It splits orders across multiple venues and uses private mempools to reduce MEV.

## Smart Contract Architecture

### Router Contract

The core \`AggregatorRouter.sol\` contract implements a multi-hop swap with on-chain route verification:

\`\`\`solidity
function executeSwap(
    SwapParams calldata params,
    RouteStep[] calldata route
) external payable nonReentrant returns (uint256 amountOut) {
    require(params.deadline >= block.timestamp, "Expired");

    amountOut = _executeRoute(params.amountIn, route);
    require(amountOut >= params.minAmountOut, "Slippage");

    emit SwapExecuted(msg.sender, params.tokenIn, params.tokenOut, amountOut);
}
\`\`\`

### Price Impact Calculation

Route optimization runs off-chain via a Rust service that simulates outcomes across all venue combinations and selects the minimum-impact path.

## Security Considerations

- Reentrancy guards on all external calls
- Slippage protection via \`minAmountOut\`
- Deadline parameter prevents stale transactions
- All contracts audited by independent security researchers

## Gas Optimization

| Operation | Gas Used | Optimization |
|---|---|---|
| Single hop | 85,000 | Inline assembly for transfers |
| Two-hop | 145,000 | Batch approval pattern |
| Three-hop | 200,000 | Packed struct storage |

## Testing

100% branch coverage with Hardhat and Foundry:

\`\`\`bash
forge test --fork-url $ETH_RPC --match-path test/Router.t.sol -v
\`\`\``,
    tags: ['Solidity', 'Hardhat', 'React', 'Web3.js', 'Ethereum'],
    featured: true,
    published: true,
    status: 'live',
  },
  {
    slug: 'nft-generative-art',
    title: 'NFT Generative Art Engine',
    description: 'An algorithmic art generation system that creates unique 10,000-piece collections using seeded randomness, flow fields, and particle systems — then mints directly to IPFS and Ethereum.',
    content: `## Overview

This project combines generative art algorithms with NFT infrastructure to create fully on-chain artworks. Each piece is algorithmically unique, derived from the token ID as a seed, ensuring deterministic reproducibility.

## Generation Algorithm

The artwork uses layered flow fields driven by Perlin noise:

\`\`\`javascript
function generateArtwork(seed) {
  const rng = seedRandom(seed)
  const palette = selectPalette(rng)

  const field = new FlowField({
    resolution: 20,
    noise: (x, y) => noise.simplex3(x * 0.003, y * 0.003, seed * 0.1),
  })

  return field.trace(2000, {
    stepSize: 2,
    lifetime: 200,
    colorFn: (t) => interpolateColor(palette, t),
  })
}
\`\`\`

## Trait System

Each NFT has 7 trait categories with varying rarities:

- **Background** (10 variants) — base color field
- **Flow Style** (6 variants) — algorithm type
- **Palette** (15 variants) — color scheme
- **Density** (4 variants) — particle count
- **Stroke Weight** (3 variants) — line thickness
- **Special Effect** (5% chance) — glow / interference patterns
- **Frame** (20 variants) — border treatment

## IPFS Pipeline

\`\`\`python
def upload_to_ipfs(artwork_path: str, metadata: dict) -> str:
    image_cid = ipfs_client.add(artwork_path)["Hash"]
    metadata["image"] = f"ipfs://{image_cid}"
    metadata_cid = ipfs_client.add_json(metadata)
    return metadata_cid
\`\`\`

## Smart Contract

The ERC-721 contract uses a commit-reveal scheme for fair mint ordering and stores trait data on-chain as packed uint256 values to minimize storage costs.

## Results

The collection sold out in 4 minutes, generating 320 ETH in primary sales with 180 ETH in secondary volume in the first month.`,
    tags: ['Python', 'p5.js', 'IPFS', 'Solidity', 'OpenSea API'],
    featured: false,
    published: true,
    status: 'live',
  },
]

export const seedPosts = [
  {
    slug: 'building-defi-dashboard',
    title: 'Building a DeFi Dashboard with Next.js and Supabase',
    excerpt: 'A deep-dive into building a multi-chain DeFi portfolio tracker — covering architecture decisions, real-time data fetching, and the surprising edge cases that come with on-chain data.',
    content: `## Why I Built This

After managing DeFi positions across five protocols and three chains, I got tired of bouncing between Zapper, DeBank, and block explorers. I wanted one dashboard built exactly the way I think about my portfolio — so I built it.

This post walks through the technical decisions that shaped the architecture.

## Architecture Overview

The app is a Next.js 16 app with App Router, using Supabase for persistence and server-side Supabase queries for data fetching. Real-time price updates come from a WebSocket connection to a price aggregation service.

### Data Flow

\`\`\`
User request
    ↓
Next.js Server Component
    ↓ parallel fetch
Supabase (cached snapshots) + RPC calls (live positions)
    ↓
Normalize → calculate PnL → render
\`\`\`

Server Components handle the initial snapshot — this means the page is fully rendered HTML on first load with no loading spinners. Client components take over for real-time price ticks.

## Handling Multi-Chain Data

Each chain has a different RPC, different token list, and different protocols. The normalizer is the most important piece:

\`\`\`typescript
interface Position {
  protocol: string
  chain: Chain
  type: 'lending' | 'liquidity' | 'staking' | 'wallet'
  tokens: TokenAmount[]
  valueUSD: number
}

async function normalizePosition(raw: RawPosition): Promise<Position> {
  const prices = await getPrices(raw.tokens.map(t => t.address))
  return {
    ...raw,
    valueUSD: raw.tokens.reduce((sum, t) => sum + t.amount * prices[t.address], 0),
  }
}
\`\`\`

## The Caching Problem

On-chain data is expensive to fetch. A full portfolio fetch can hit 30+ RPC calls. My solution:

1. **Aggressive caching** — Supabase stores hourly snapshots. The dashboard shows the cached snapshot instantly, then diffs against a live fetch in the background.
2. **Edge caching** — Price data cached at the edge with a 30-second TTL.
3. **Selective invalidation** — Only re-fetch positions that changed in the last block.

## Supabase RLS for Multi-User

Row-level security lets users see only their own portfolios:

\`\`\`sql
CREATE POLICY "Users see own portfolios"
ON portfolios FOR SELECT
USING (auth.uid() = user_id);
\`\`\`

This runs at the database level — no application-layer checks needed.

## What I'd Do Differently

- Use a queue (like Inngest) instead of cron jobs for snapshot generation
- Normalize chain IDs to EIP-155 integers from the start instead of string names
- Add TypeScript generics to the position normalizer earlier — retrofitting was painful

## Next Steps

Adding support for Cosmos chains and a mobile app (React Native with the same Supabase backend).`,
    tags: ['Next.js', 'Supabase', 'DeFi', 'TypeScript'],
    published: true,
    published_at: new Date('2025-11-15').toISOString(),
  },
  {
    slug: 'understanding-mev',
    title: 'Understanding MEV: Maximal Extractable Value Explained',
    excerpt: 'MEV is one of the most misunderstood concepts in crypto. This post breaks down what it is, how searchers exploit it, and what Ethereum\'s current defenses look like.',
    content: `## What is MEV?

Maximal Extractable Value (MEV) refers to profit a block producer can extract by reordering, inserting, or censoring transactions within a block. The term originated as "Miner Extractable Value" in 2019 but was renamed after Ethereum's move to Proof of Stake.

In 2024, MEV extraction exceeded $1.5 billion on Ethereum alone.

## How Searchers Find MEV

Searchers are bots that monitor the public mempool for profitable opportunities:

### Arbitrage

If token X trades at $100 on Uniswap and $100.50 on Sushiswap, a searcher can buy on Uniswap and sell on Sushiswap in the same transaction for risk-free profit.

\`\`\`solidity
function arbFlash(address token, uint256 amount) external {
    // 1. Flash loan from Aave
    // 2. Buy on cheaper DEX
    // 3. Sell on expensive DEX
    // 4. Repay flash loan + fee
    // 5. Pocket the difference
}
\`\`\`

### Sandwich Attacks

When a large swap is pending in the mempool, a sandwicher:

1. Inserts a buy order **before** the victim's trade (frontrun)
2. Lets the victim's trade execute (moving the price up)
3. Sells immediately **after** the victim (backrun)

The victim gets a worse price; the sandwicher captures the difference.

### Liquidations

DeFi lending protocols like Aave liquidate undercollateralized positions. When a position crosses the liquidation threshold, a race begins — whoever liquidates first gets the bonus.

## MEV Infrastructure

The MEV supply chain looks like:

| Actor | Role |
|---|---|
| Searcher | Finds opportunities, crafts bundles |
| Builder | Assembles optimal blocks from bundles |
| Relay | Passes blocks from builders to validators |
| Validator | Proposes the most profitable block |

**MEV-Boost** (used by ~90% of Ethereum validators) enables this separation, allowing specialized builders to compete for block space.

## Defenses

### For Users

- **Slippage limits**: Set tight slippage (0.1–0.3%) to make sandwich attacks unprofitable
- **Private mempools**: Services like Flashbots Protect route transactions directly to builders, bypassing the public mempool
- **MEV-aware AMMs**: CoW Swap batches trades off-chain and settles optimally, eliminating sandwich attacks

### For Protocols

- **TWAP oracles**: Time-weighted prices resist single-block manipulation
- **Commit-reveal schemes**: Hide intent until execution
- **Frequent batch auctions**: Execute all trades at a single clearing price

## Is MEV Good or Bad?

MEV is a natural byproduct of open, permissionless blockchains. Some MEV (like arbitrage) improves price efficiency across markets. Other MEV (sandwiching) is purely extractive and harms users.

The ongoing work is to minimize harmful MEV while preserving beneficial MEV and keeping the network decentralized.`,
    tags: ['MEV', 'Ethereum', 'DeFi', 'Security'],
    published: true,
    published_at: new Date('2025-12-02').toISOString(),
  },
  {
    slug: 'generative-art-blockchain',
    title: 'Generative Art on the Blockchain: From Code to NFT',
    excerpt: 'How I built a 10,000-piece generative art collection using flow fields, seeded randomness, and a Solidity contract that stores trait data entirely on-chain.',
    content: `## The Idea

I wanted to create artwork that was both visually compelling and technically interesting — something that demonstrated the unique properties of blockchain-native art: verifiable scarcity, provable randomness, and on-chain storage.

The result was a 10,000-piece collection of flow field paintings, each uniquely derived from its token ID.

## Generative Art Fundamentals

### Seeded Randomness

The core insight: if you use the token ID as a random seed, the artwork is deterministic. Anyone can regenerate any piece from just the token ID and the algorithm.

\`\`\`javascript
import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

function generatePiece(tokenId) {
  const prng = alea(tokenId.toString())
  const noise2D = createNoise2D(prng)

  return {
    palette: selectPalette(prng),
    flowField: buildFlowField(noise2D),
    density: Math.floor(prng() * 3000) + 1000,
  }
}
\`\`\`

### Flow Fields

A flow field assigns a direction vector to every point in 2D space. Particles follow these vectors, creating organic curves:

\`\`\`javascript
class FlowField {
  constructor(noise2D, scale = 0.002) {
    this.noise2D = noise2D
    this.scale = scale
  }

  angle(x, y, z = 0) {
    return this.noise2D(x * this.scale, y * this.scale) * Math.PI * 4
  }

  trace(particle, steps) {
    const path = [{ x: particle.x, y: particle.y }]
    for (let i = 0; i < steps; i++) {
      const angle = this.angle(particle.x, particle.y)
      particle.x += Math.cos(angle) * particle.speed
      particle.y += Math.sin(angle) * particle.speed
      path.push({ x: particle.x, y: particle.y })
    }
    return path
  }
}
\`\`\`

## The NFT Contract

### Storing Traits On-Chain

Instead of pointing to an IPFS metadata JSON, I encoded all traits into a single uint256 using bit packing:

\`\`\`solidity
// Bits 0-3: palette (16 options)
// Bits 4-6: flow style (8 options)
// Bits 7-9: density tier (8 options)
// Bits 10-13: background (16 options)
// Bit 14: special effect flag

function getTraits(uint256 tokenId) public view returns (Traits memory) {
    uint256 packed = _traitData[tokenId];
    return Traits({
        palette: uint8(packed & 0xF),
        flowStyle: uint8((packed >> 4) & 0x7),
        density: uint8((packed >> 7) & 0x7),
        background: uint8((packed >> 10) & 0xF),
        hasSpecial: (packed >> 14) & 0x1 == 1
    });
}
\`\`\`

This means traits are readable on-chain — no IPFS dependency, no metadata server.

### Fair Mint with Commit-Reveal

To prevent sniping rare traits during mint:

1. **Commit phase**: Collectors pay and receive a commitment hash
2. **Reveal phase**: After mint sells out, a VRF-based reveal assigns token IDs to commitments randomly

This ensures no one can pick which traits they mint.

## Lessons Learned

**Start with the algorithm, not the contract.** I spent three weeks iterating on the generative algorithm before writing a single line of Solidity. This was the right call — the art is what matters.

**IPFS is not forever.** Several early NFT projects have broken images because their IPFS nodes went offline. On-chain SVG or trait data is the only truly permanent option.

**Gas costs matter at scale.** On-chain trait storage cost ~50,000 gas per token at mint. For 10,000 tokens, that's 500M gas total. Bit packing reduced this by 60%.

## What's Next

I'm exploring fully on-chain SVG generation — where the actual image is rendered from Solidity, not just the traits. The gas costs are high but the permanence is unmatched.`,
    tags: ['Generative Art', 'NFT', 'Solidity', 'p5.js', 'Creative Coding'],
    published: true,
    published_at: new Date('2026-01-20').toISOString(),
  },
]
