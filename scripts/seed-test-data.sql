-- ============================================================
-- TEST SEED: 10 Projects + 10 Blog Posts
-- Run in Supabase SQL Editor
-- To remove: run scripts/delete-test-data.sql
-- ============================================================

-- Projects ----------------------------------------------------

INSERT INTO projects (slug, title, description, content, tags, url, github_url, featured, published) VALUES

('defi-yield-aggregator',
 'DeFi Yield Aggregator',
 'A smart contract system that automatically routes funds to the highest-yielding DeFi protocols across Aave, Compound, and Yearn.',
 '## Overview

This yield aggregator monitors APY across major lending protocols in real time and rebalances user funds to maximize returns.

## Architecture

- **Vault contract** holds user deposits and issues share tokens
- **Strategy contracts** implement protocol-specific deposit/withdraw logic
- **Keeper bot** triggers rebalancing when yield differential exceeds threshold

## Key Features

- Gas-optimized batch rebalancing
- Emergency withdrawal mechanism
- On-chain APY oracle integration

## Stack

Solidity · Hardhat · Ethers.js · The Graph · React',
 ARRAY['Solidity','DeFi','Smart Contracts','Ethereum'],
 'https://yield.example.com', 'https://github.com/example/yield-aggregator',
 true, true),

('nft-marketplace',
 'NFT Marketplace',
 'A gas-efficient NFT marketplace supporting ERC-721 and ERC-1155 with lazy minting, royalties, and Dutch auction listings.',
 '## Overview

Full-featured NFT marketplace built on Ethereum with support for lazy minting to reduce upfront gas costs for creators.

## Smart Contracts

- **Marketplace.sol** — listing, bidding, settlement
- **LazyMint.sol** — EIP-712 signature-based minting on first sale
- **Royalty.sol** — EIP-2981 on-chain royalty standard

## Stack

Solidity · Next.js · RainbowKit · IPFS · Pinata',
 ARRAY['NFT','Solidity','Next.js','IPFS'],
 'https://nft.example.com', 'https://github.com/example/nft-marketplace',
 true, true),

('on-chain-dao',
 'On-Chain Voting DAO',
 'A fully on-chain DAO with token-weighted voting, timelocked execution, and a delegation system inspired by Compound Governor.',
 '## Overview

A governance framework where token holders propose and vote on protocol changes with no trusted intermediary.

## Contracts

- **GovernorBravo** fork with custom quorum logic
- **Timelock** — 48-hour delay on all executions
- **GovernanceToken** — ERC-20 with EIP-712 vote delegation

## Voting Flow

1. Any holder with >1000 tokens can propose
2. 7-day voting window
3. Passes with >4% quorum and simple majority
4. Queued in timelock, then executed

## Stack

Solidity · OpenZeppelin · Hardhat · Tally.xyz integration',
 ARRAY['DAO','Governance','Solidity','DeFi'],
 NULL, 'https://github.com/example/on-chain-dao',
 false, true),

('cross-chain-bridge',
 'Cross-Chain Asset Bridge',
 'A trustless bridge using optimistic verification to move ERC-20 tokens between Ethereum, Arbitrum, and Optimism.',
 '## Overview

This bridge uses a lock-and-mint model with a fraud-proof window, inspired by the Optimism canonical bridge design.

## How It Works

1. User locks tokens on source chain
2. Relayer submits merkle proof to destination chain
3. 7-day challenge window for fraud proofs
4. Tokens minted on destination after window

## Stack

Solidity · Hardhat · Optimism SDK · TypeScript',
 ARRAY['Bridge','Cross-chain','Solidity','Layer 2'],
 NULL, 'https://github.com/example/cross-chain-bridge',
 true, true),

('ai-contract-auditor',
 'AI Smart Contract Auditor',
 'An LLM-powered tool that analyzes Solidity code for reentrancy, integer overflow, and access control vulnerabilities.',
 '## Overview

Paste any Solidity contract and get an AI-generated security report with severity ratings and suggested fixes.

## How It Works

- Parses AST with solc-js
- Chunks code into context windows
- Sends structured prompts to Claude API
- Returns findings in SARIF format

## Vulnerability Coverage

- Reentrancy (SWC-107)
- Integer overflow/underflow
- Unchecked return values
- tx.origin authentication

## Stack

Next.js · Claude API · solc-js · TypeScript',
 ARRAY['AI','Security','Solidity','Claude API'],
 'https://audit.example.com', 'https://github.com/example/ai-auditor',
 true, true),

('crypto-portfolio-tracker',
 'Crypto Portfolio Tracker',
 'Real-time dashboard aggregating balances across 10+ chains with PnL tracking, tax lot accounting, and CSV export.',
 '## Overview

Connect your wallets and get a unified view of all holdings with historical performance charts.

## Features

- Multi-chain balance aggregation (EVM + Solana)
- Historical price snapshots for PnL
- FIFO/LIFO tax lot accounting
- CSV export for tax software

## Stack

Next.js · TypeScript · Prisma · PostgreSQL · Recharts',
 ARRAY['Portfolio','Analytics','Next.js','TypeScript'],
 'https://portfolio.example.com', 'https://github.com/example/portfolio-tracker',
 false, true),

('mev-sandwich-bot',
 'MEV Sandwich Bot (Research)',
 'A research implementation of a sandwich bot for studying MEV extraction mechanics and building better mempool monitoring tools.',
 '## Overview

> Educational/research purposes only.

Monitors the public mempool for large DEX swaps and simulates sandwich attack profitability to understand MEV mechanics.

## Architecture

- **Mempool scanner** — subscribes to pending txs via websocket
- **Profit simulator** — calculates expected profit after gas
- **Bundle builder** — constructs Flashbots bundles

## Stack

TypeScript · Ethers.js · Flashbots SDK · Hardhat fork testing',
 ARRAY['MEV','Research','Ethers.js','Flashbots'],
 NULL, 'https://github.com/example/mev-research',
 false, true),

('liquidity-analytics',
 'Liquidity Pool Analytics',
 'On-chain analytics dashboard for Uniswap v3 concentrated liquidity — tracking fee income, impermanent loss, and range utilization.',
 '## Overview

Uniswap v3 introduced concentrated liquidity, making LP position management significantly more complex. This dashboard demystifies it.

## Metrics Tracked

- Fee APR by tick range
- Impermanent loss vs hold
- Position in-range % over time
- TVL depth chart

## Stack

Next.js · The Graph · PostgreSQL · Recharts · TypeScript',
 ARRAY['DeFi','Analytics','Uniswap','The Graph'],
 'https://lp.example.com', 'https://github.com/example/lp-analytics',
 false, true),

('web3-auth-sdk',
 'Web3 Auth SDK',
 'A drop-in authentication library supporting MetaMask, WalletConnect, and Coinbase Wallet with session management and SIWE.',
 '## Overview

Sign-In with Ethereum (EIP-4361) made easy. One hook, any wallet, works with NextAuth.

## Usage

```ts
const { signIn, session } = useWeb3Auth()
await signIn()
console.log(session.address)
```

## Features

- EIP-4361 SIWE message construction
- JWT session tokens
- NextAuth adapter
- ENS name resolution

## Stack

TypeScript · Viem · NextAuth · EIP-4361',
 ARRAY['Auth','SDK','TypeScript','Ethereum'],
 'https://www.npmjs.com/package/web3-auth-sdk', 'https://github.com/example/web3-auth-sdk',
 false, true),

('zk-identity',
 'ZK Proof Identity System',
 'A privacy-preserving identity system using Groth16 proofs to verify credentials without revealing underlying personal data.',
 '## Overview

Prove attributes about yourself on-chain without revealing the underlying data. Built with Circom and SnarkJS.

## Circuits

- **AgeProof** — prove age > 18 without revealing birthdate
- **KYCProof** — prove KYC approval from whitelisted issuer
- **MerkleProof** — prove set membership

## Flow

1. Issuer signs credential off-chain
2. User generates ZK proof locally in browser
3. Verifier contract checks proof on-chain

## Stack

Circom · SnarkJS · Solidity · Next.js · TypeScript',
 ARRAY['ZK Proofs','Privacy','Circom','Solidity'],
 NULL, 'https://github.com/example/zk-identity',
 true, true);

-- Blog Posts --------------------------------------------------

INSERT INTO posts (slug, title, excerpt, content, tags, published, published_at) VALUES

('understanding-defi-yield-strategies',
 'Understanding DeFi Yield Strategies',
 'A deep dive into yield farming, liquidity mining, and lending protocols — and the risks hiding underneath.',
 '## What Is Yield in DeFi?

In traditional finance, yield comes from lending to creditworthy borrowers. In DeFi, yield comes from:

1. **Lending** — deposit into Aave or Compound, earn interest from borrowers
2. **Liquidity provision** — supply to AMMs like Uniswap, earn swap fees
3. **Liquidity mining** — protocols reward LPs with governance tokens
4. **Staking** — lock tokens to secure a network, earn inflationary rewards

## The Risk Spectrum

| Strategy | Yield Source | Main Risk |
|---|---|---|
| ETH staking | Consensus rewards | Slashing |
| Stablecoin lending | Borrower interest | Smart contract bug |
| ETH/USDC LP | Swap fees | Impermanent loss |
| Leverage farming | Protocol tokens | Token collapse |

## My Rule of Thumb

If you cannot explain the yield source in one sentence, it is probably not sustainable.',
 ARRAY['DeFi','Yield','Blockchain','Finance'],
 true, NOW() - INTERVAL '30 days'),

('how-nfts-work-under-the-hood',
 'How NFTs Actually Work Under the Hood',
 'Everyone knows what an NFT is. But what actually happens when you mint one? Let us trace the entire journey.',
 '## The Myth of "Owning" an NFT

Most NFTs do not store the image on-chain. Your token is actually just a number pointing to a URL.

## What ERC-721 Actually Is

An ERC-721 contract is essentially a mapping:

```solidity
mapping(uint256 tokenId => address owner) private _owners;
```

The blockchain records who owns token #4821, not the image itself.

## Where the Metadata Lives

The `tokenURI` function returns a URL pointing to a JSON file with the image URI. If it points to `https://api.myproject.com/4821`, the team can change or delete it anytime.

IPFS content-addressed URIs are immutable — but only if someone is pinning the data.

## Fully On-Chain NFTs

Projects like Nouns and Autoglyphs generate everything in the contract itself, returning base64-encoded SVG directly. These are the only truly permanent NFTs.',
 ARRAY['NFT','Solidity','Ethereum','Web3'],
 true, NOW() - INTERVAL '25 days'),

('building-a-dao-from-scratch',
 'Building a DAO from Scratch',
 'A practical walkthrough of spinning up a DAO: token design, governance contracts, voting UX, and the attacks nobody warns you about.',
 '## What Makes a DAO a DAO?

Three components:
1. A treasury controlled by the contract, not a multisig
2. A governance token that gives voting power
3. A proposal system where token holders vote on fund disbursements

## The Governor Pattern

Compound invented the Governor Bravo pattern that almost everyone copies:

```
Token → propose() → vote() → queue() → execute()
```

OpenZeppelin ships a modular Governor contract you can inherit and customize.

## Governance Attacks to Know

**Flash Loan Attack** — borrow governance tokens, vote, repay in one tx. Defense: require tokens held for at least one block.

**Low Quorum Snipe** — a coordinated minority can pass anything if most holders are passive.

**Governance Griefing** — spam proposals to force defenders to spend gas voting no.

## Honest Take

Most DAOs would be better off as a 4-of-7 multisig for the first year.',
 ARRAY['DAO','Governance','Solidity','DeFi'],
 true, NOW() - INTERVAL '20 days'),

('mev-the-dark-forest',
 'MEV: The Dark Forest Explained',
 'Validators extract hundreds of millions per year from regular users through front-running and sandwiching. Here is how.',
 '## What Is MEV?

Maximal Extractable Value is profit extracted by reordering, inserting, or censoring transactions within a block.

## The Three Main Strategies

**Arbitrage** — spot a price discrepancy between DEXs, trade atomically. This is "good" MEV.

**Front-running** — see a large buy in the mempool, buy before it, sell after. The victim gets a worse price.

**Sandwich Attack** — front-run AND back-run the same transaction for double profit.

## Flashbots and the Solution

Flashbots created a private relay letting you submit bundles directly to block builders, bypassing the public mempool.

## Protection for Regular Users

- Use a private RPC (MEV Blocker, Flashbots Protect)
- Set slippage tolerance to minimum needed
- Use DEXs with built-in slippage protection',
 ARRAY['MEV','Ethereum','DeFi','Security'],
 true, NOW() - INTERVAL '18 days'),

('zk-proofs-for-beginners',
 'ZK Proofs for Beginners',
 'Zero-knowledge proofs are the most powerful cryptographic primitive since public-key encryption. Here is the intuition.',
 '## The Core Idea

Prove you know something without revealing the thing itself.

## A Simple Example: Sudoku

You claim to have solved a puzzle. I want to verify without seeing the solution:

1. You commit to the solution (hash each cell)
2. I randomly ask you to reveal a row, column, or 3x3 box
3. You reveal that slice — I verify it contains 1-9 with no repeats
4. Repeat 30 times — by now I am statistically convinced

## ZK-SNARKs in Plain English

- **Succinctness** — the proof is tiny regardless of computation size
- **Non-interactive** — one message, no back-and-forth
- **Argument of Knowledge** — you cannot fake a valid proof without knowing the witness

## Practical Applications

- **zkSync/StarkNet** — prove thousands of transactions valid, post one proof
- **Privacy coins** — prove you have enough balance without revealing the amount
- **Identity** — prove you are over 18 without revealing your birthdate',
 ARRAY['ZK Proofs','Cryptography','Blockchain','Privacy'],
 true, NOW() - INTERVAL '15 days'),

('smart-contract-security-best-practices',
 'Smart Contract Security Best Practices',
 'After auditing dozens of contracts, these are the patterns exploited most often — and how to write code that avoids them.',
 '## The Reentrancy Classic

The DAO hack in 2016 drained $60M. The pattern is still found in new contracts today.

```solidity
// VULNERABLE
function withdraw() external {
    uint amount = balances[msg.sender];
    (bool ok,) = msg.sender.call{value: amount}("");
    balances[msg.sender] = 0; // Too late!
}

// SAFE: Checks-Effects-Interactions
function withdraw() external {
    uint amount = balances[msg.sender];
    balances[msg.sender] = 0;  // Effect first
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
}
```

## Access Control Mistakes

Missing or incorrect access control on privileged functions is the most common critical vulnerability.

## Oracle Manipulation

Do not use `token.balanceOf(pool)` as a price oracle — it can be manipulated in one tx with a flash loan. Use Chainlink or a TWAP.

## Security Checklist

- CEI pattern on all state-changing functions
- All external calls checked for return value
- Emergency pause mechanism
- Fuzzing with Foundry before deploying
- Professional audit before mainnet',
 ARRAY['Security','Solidity','Smart Contracts','Auditing'],
 true, NOW() - INTERVAL '12 days'),

('cross-chain-interoperability-future',
 'The Future of Cross-Chain Interoperability',
 'We have 50+ chains. Bridging between them has cost $2B+ in hacks. What does a good solution look like?',
 '## The Problem

DeFi liquidity is fragmented across Ethereum, Arbitrum, Optimism, Base, Solana, and dozens of others.

- **Canonical bridges** — safe but 7-day withdrawal delays
- **Third-party bridges** — faster but $2B+ hacked (Ronin, Wormhole, Nomad)

## Why Bridges Get Hacked

Most bridge hacks follow the same pattern: the off-chain validator set is compromised. The Ronin bridge used 9 validators, 5 of which were controlled by Sky Mavis itself.

## Promising Approaches

**Light Client Bridges** — verify source chain consensus directly on destination. IBC does this.

**Intent-Based Bridges** — solvers fill your order instantly using their own capital, then settle asynchronously. ERC-7683.

**Shared Sequencers** — if L2s share a sequencer, atomic cross-chain transactions become possible.

## My Prediction

Intent-based protocols win near term on UX. zkBridges win long term on security.',
 ARRAY['Cross-chain','Bridges','Layer 2','Interoperability'],
 true, NOW() - INTERVAL '10 days'),

('solana-vs-ethereum',
 'Building on Solana vs Ethereum: An Honest Comparison',
 'I have shipped projects on both. Here is what the documentation does not tell you.',
 '## Developer Experience

**Ethereum:** Solidity is simple, tooling is mature (Hardhat, Foundry, Slither), documentation is excellent.

**Solana:** Rust programs have a steep learning curve. The account model is genuinely unintuitive. But once you get it, programs are composable in interesting ways.

## Ecosystem

Ethereum + L2s dominates TVL by a wide margin. If you are building DeFi, Arbitrum and Base are where the users are.

Solana dominates in NFTs, consumer apps, and high-frequency trading.

## Cost Model

| Chain | Cost per tx |
|---|---|
| Ethereum mainnet | $5–50 |
| Arbitrum / Base | $0.01–0.10 |
| Solana | ~$0.00025 |

## When I Choose Each

**Solana**: Consumer apps needing instant confirmation, NFTs, >1000 TPS requirements.

**Ethereum + L2**: DeFi protocols, maximum composability with existing protocols.',
 ARRAY['Solana','Ethereum','Developer Experience','Blockchain'],
 true, NOW() - INTERVAL '8 days'),

('gas-optimization-solidity',
 'Gas Optimization Tricks in Solidity',
 'Every unit of gas saved is money in your users pockets. Patterns to cut costs by 20-50% without sacrificing readability.',
 '## Storage Is the Most Expensive Thing

An SSTORE costs 20,000 gas. An ADD costs 3.

**Pack variables into one slot:**

```solidity
// Bad: 3 storage slots
uint256 a;
uint128 b;
uint128 c;

// Good: 2 storage slots (b and c share a slot)
uint256 a;
uint128 b;
uint128 c;
```

## Use calldata for Read-Only Params

```solidity
// Good — calldata is cheaper for arrays you do not modify
function process(uint256[] calldata items) external { ... }
```

## Cache Storage Reads in Memory

```solidity
// Good: 1 SLOAD instead of 3
uint256 bal = balances[user];
if (bal > 0) {
    emit Withdraw(user, bal);
    balances[user] = 0;
}
```

## Custom Errors vs require Strings

```solidity
// Good: 4-byte selector, ~50 gas cheaper per revert
error AmountZero();
if (amount == 0) revert AmountZero();
```',
 ARRAY['Solidity','Gas Optimization','Ethereum','Smart Contracts'],
 true, NOW() - INTERVAL '5 days'),

('web3-auth-beyond-metamask',
 'Web3 Authentication: Beyond MetaMask',
 'SIWE is great, but most users do not have MetaMask. How to build auth that works for crypto natives and newcomers alike.',
 '## The Problem with Wallet-Only Auth

Sign-In with Ethereum is elegant. But only ~5% of internet users have a crypto wallet.

## A Hybrid Auth Architecture

```
User authenticates with:
  Wallet (MetaMask, WalletConnect, Coinbase)
  Email + Magic Link (Privy, Magic.link)
  Social (Google, Twitter via OAuth)
        All mapped to a unified identity
        EVM address generated for non-wallet users
```

## Embedded Wallets

Privy and Dynamic create custodied wallets for email/social users. The user gets Web2 login UX but still has an on-chain identity.

## Account Abstraction (ERC-4337)

With ERC-4337, wallets can be smart contracts. This enables:

- **Social recovery** — designate guardians who can replace your key
- **Gasless UX** — paymasters sponsor gas for new users
- **Session keys** — approve a dapp to sign for 1 hour without popups

## My Recommendation

Use Privy for consumer apps. Use raw SIWE for DeFi protocols where users are already wallet-native.',
 ARRAY['Auth','Web3','ERC-4337','UX'],
 true, NOW() - INTERVAL '2 days');
