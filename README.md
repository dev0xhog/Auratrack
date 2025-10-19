
# Auratrack

Auratrack is a lightweight EVM wallet portfolio tracker and strategy explorer built as an AURA Hackathon submission. It surfaces portfolio balances, token valuations, NFTs and transactions — and it uses Aura's Portfolio Strategies API to provide personalized, AI-driven strategy suggestions for a given wallet.

This README highlights the project's priority integrations (Aura APIs) first, then documents other data sources, how to run the app locally, and where to find the main code paths.

---

## Quick highlights
- Primary integrations (high priority):
  - Aura Portfolio Balances API — provides per-network token balances and USD valuations
  - Aura Portfolio Strategies API — returns AI-driven strategy recommendations for a wallet
- Secondary integrations: Moralis (transactions, token metadata, NFT logos), Alchemy (NFTs), CoinGecko/CoinCap (prices), Etherscan (fallback txs)

---

## What Auratrack does
- Show a portfolio overview for any EVM wallet address: token list, per-network breakdown, total USD value and a simple composition chart.
- Surface NFT holdings and filter likely spam NFTs.
- Display recent transactions and token transfers (multi-chain where possible).
- Provide strategy suggestions based on the wallet's holdings using Aura's Portfolio Strategies API. These are shown on the Strategies page and are normalized for easy display.

## Aura APIs — priority (please review first)
These two endpoints are the core of the hackathon submission and are used directly by hooks in the project.

- Portfolio Balances
  - GET https://aura.adex.network/api/portfolio/balances?address={address}
  - Used by: `src/hooks/usePortfolioBalances.ts`
  Auratrack is an EVM wallet portfolio tracker and strategy recommender built as an AURA Hackathon submission. It fetches portfolio balances and generates AI-driven strategies via the Aura APIs, and augments the UI with NFTs, transaction history, token prices and charts.

  ## Priority: Aura APIs (must-see)
  - Portfolio Balances API endpoint used by this project:
    - GET https://aura.adex.network/api/portfolio/balances?address={address}
    - Where {address} is an EVM wallet address (hex). The project calls this endpoint from `src/hooks/usePortfolioBalances.ts`.
  - Portfolio Strategies API endpoint used by this project:
    - GET https://aura.adex.network/api/portfolio/strategies?address={address}
    - The project calls this endpoint from `src/hooks/usePortfolioStrategies.ts` and flattens the returned strategies for display. The UI powered by this endpoint is in `src/components/portfolio/PortfolioStrategiesSection.tsx`.

  Notes for reviewers:
  - See `src/hooks/usePortfolioBalances.ts` and `src/hooks/usePortfolioStrategies.ts` for exact request/response handling and types used.
  - The UI pages that surface this data are `src/pages/Portfolio.tsx` and `src/pages/Strategies.tsx`.

  ## Other APIs used (secondary priority)
  - Moralis (transaction, token metadata, NFTs fallback): used across multiple hooks and components for transactions, token logos and NFT metadata. Files: `src/hooks/*moralis*.ts`, `src/components/portfolio/TokenLogo.tsx`, `src/components/transactions/TokenIcon.tsx`, `src/hooks/useMoralisNFTsByChain.ts`.
    - Moralis endpoints observed in code (headers expect X-API-Key): deep-index.moralis.io API paths for transactions, erc20 metadata, NFTs.
    - Environment variable: `VITE_MORALIS_API_KEY` (note: repository contains hardcoded demo keys in several places — these should be replaced with env variables before publishing).
  - Alchemy (NFT fetching when supported chains are present): `src/hooks/useMoralisNFTsByChain.ts` uses Alchemy NFT APIs as a source and converts Alchemy responses to a Moralis-like shape.
    - Environment variable: `VITE_ALCHEMY_API_KEY` (fallback demo key used in code).
  - CoinGecko (current token prices for portfolio): used in `src/pages/Portfolio.tsx` to fetch USD prices and 24hr change.
  - CoinCap (bulk token price list): used in `src/hooks/useTokenPrices.ts` as a fallback/no-key source.
  - Etherscan (transaction list fallback): used in `src/hooks/useTransactions.ts` when needed. Environment variable: `VITE_ETHERSCAN_API_KEY`.

  ## Features implemented
  - Portfolio overview by wallet address with token list, charts and total USD value.
  - Per-network breakdown of balances (data comes from Aura Balances API response structure).
  - AI-driven strategy recommendations (from Aura Portfolio Strategies API) displayed on the Strategies page.
  - Transactions and token transfer views powered by Moralis (multi-chain where possible).
  - NFT gallery using Alchemy (multi-chain) with spam filtering.
  - Token logo fallback chain: TrustWallet CDN -> Moralis -> placeholder.

  ## Tech stack
  - Vite + React + TypeScript
  - Tailwind CSS for styling
  - React Query for data fetching/caching
  - Wagmi for wallet integration (see `src/config/wagmi.ts`)

  ## How to run (local)
  1. Install dependencies (uses npm by default):
     - npm install
  2. Create a .env file in the project root (or use your env manager) and set the following variables (see Security & keys below):
     - VITE_MORALIS_API_KEY (recommended)
     - VITE_ALCHEMY_API_KEY (recommended for NFT features)
     - VITE_ETHERSCAN_API_KEY (optional, tx fallback)
  3. Start dev server:
     - npm run dev
  4. Open http://localhost:5173 (or the port Vite shows) and navigate to Portfolio or Strategies.

  ## Important files and where to look
  - Aura integration
    - `src/hooks/usePortfolioBalances.ts` — calls Aura Balances API
    - `src/hooks/usePortfolioStrategies.ts` — calls Aura Strategies API and normalizes response
    - `src/components/portfolio/PortfolioStrategiesSection.tsx` — UI using strategies
    - `src/pages/Portfolio.tsx` — main portfolio page consuming balances
  - Moralis / Transactions / Tokens
    - `src/hooks/useMoralisTransactions*.ts` — transaction hooks (single and multi-chain)
    - `src/hooks/useMoralisTokenTransfersByChain.ts` — token transfers
    - `src/components/transactions/TokenIcon.tsx` — token logo fallback logic
  - NFTs
    - `src/hooks/useMoralisNFTsByChain.ts` — uses Alchemy per-chain to fetch NFTs and convert to internal shape
    - `src/components/nft` — NFT card and list UI
  - Token prices and charts
    - `src/hooks/useTokenPrices.ts` — CoinCap
    - `src/pages/Portfolio.tsx` — also fetches CoinGecko for token prices and 24h change

  ## Known issues & notes
  - Some chains (e.g., Mantle) are handled with hardcoded address/logo fallbacks — Moralis might not support newer chains fully.
  - Tests are not included; this is a demo/hackathon app meant to showcase integrations and UX.


  ## Contact and credits
  - Author: dev0xhog
  - Built for: AURA Hackathon — main integrations are Aura Portfolio Balances API and Aura Portfolio Strategies API.
