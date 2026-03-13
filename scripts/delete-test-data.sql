-- ============================================================
-- DELETE TEST DATA
-- Removes all records inserted by seed-test-data.sql
-- Run in Supabase SQL Editor
-- ============================================================

DELETE FROM projects WHERE slug IN (
  'defi-yield-aggregator',
  'nft-marketplace',
  'on-chain-dao',
  'cross-chain-bridge',
  'ai-contract-auditor',
  'crypto-portfolio-tracker',
  'mev-sandwich-bot',
  'liquidity-analytics',
  'web3-auth-sdk',
  'zk-identity'
);

DELETE FROM posts WHERE slug IN (
  'understanding-defi-yield-strategies',
  'how-nfts-work-under-the-hood',
  'building-a-dao-from-scratch',
  'mev-the-dark-forest',
  'zk-proofs-for-beginners',
  'smart-contract-security-best-practices',
  'cross-chain-interoperability-future',
  'solana-vs-ethereum',
  'gas-optimization-solidity',
  'web3-auth-beyond-metamask'
);
