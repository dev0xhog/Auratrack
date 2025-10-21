# Auratrack - Multi-Chain Portfolio Intelligence Platform

** A production-ready EVM wallet portfolio tracker with AI-powered strategy recommendations

Auratrack is a comprehensive multi-chain portfolio analytics platform that aggregates blockchain data across 18+ EVM networks and provides intelligent, AI-driven investment strategies using Aura's Portfolio APIs. Built with performance, security, and user experience as top priorities.

## Core Features

- **Real-Time Portfolio Analytics**: Track token balances and valuations across 18+ EVM chains
- **AI-Powered Strategies**: Get personalized DeFi strategy recommendations from Aura's Portfolio Strategies API
- **Multi-Chain Aggregation**: Unified view of assets across Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Avalanche, and more
- **NFT Gallery**: View and manage NFT collections with advanced spam filtering
- **Transaction History**: Complete transaction and token transfer history with multi-chain support
- **Modern UI/UX**: Responsive design with dark/light mode support
- **Security-First Architecture**: Input validation, XSS protection, and secure API handling
- **Performance Optimized**: Parallel API calls, intelligent caching, and batch processing

## Project Excellence

### Quality
- Clean, maintainable TypeScript codebase with comprehensive type safety
- Modular architecture with separation of concerns
- Reusable components and custom hooks
- Consistent coding patterns and best practices
- Comprehensive error handling and user feedback

### Performance
- **Parallel API Calls**: Fetch data from multiple chains simultaneously using batch processing
- **Intelligent Caching**: 5-minute cache for blockchain data, reducing unnecessary API calls
- **Request Batching**: Concurrent control limits to 5 requests at a time
- **Optimized Rendering**: React.memo and useMemo for expensive computations
- **Fast Initial Load**: Progressive data loading with skeleton screens

### Security
- **Input Validation**: Wallet addresses validated using regex patterns
- **XSS Prevention**: User inputs sanitized to prevent cross-site scripting attacks
- **Injection Protection**: Chain identifiers validated against allowlist
- **API Key Management**: Secure handling with environment variables
- **Error Boundary**: Prevents app crashes and information leakage
- **HTTPS Only**: All API calls use secure protocols

## Technical Implementation

### Aura API Integration
- **Portfolio Balances API**: `GET https://aura.adex.network/api/portfolio/balances?address={address}`
- **Portfolio Strategies API**: `GET https://aura.adex.network/api/portfolio/strategies?address={address}`
- Implementation files:
  - `src/hooks/usePortfolioBalances.ts`
  - `src/hooks/usePortfolioStrategies.ts`
  - `src/components/portfolio/PortfolioStrategiesSection.tsx`

### Additional APIs
- **Moralis**: Transaction data, token metadata, NFTs fallback
- **Alchemy**: NFT fetching for supported chains
- **CoinGecko**: Current token prices
- **CoinCap**: Bulk token price list
- **Etherscan**: Transaction list fallback

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS for styling
- React Query for data fetching/caching
- Wagmi for wallet integration

## Installation and Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API Keys:
   Create `.env.local` file with:
   ```env
   VITE_MORALIS_API_KEY=your_moralis_api_key_here
   VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

   **Security Note**: 
   - Never commit `.env.local` to version control
   - For Vercel deployment, add these as environment variables in project settings

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Performance Metrics
- Initial Load Time: ~2-3 seconds (18 chains, 50 transactions/chain)
- Portfolio Refresh: ~1 second (cached data)
- NFT Gallery Load: ~2-4 seconds (depends on NFT count)
- Strategy Recommendations: ~1-2 seconds
- Multi-Chain Aggregation: 5 concurrent requests, completing in 3-5 seconds

## Known Limitations
- Limited support for newer chains (e.g., Mantle) on Moralis
- CoinGecko free tier rate limits may affect price data
- NFT spam detection may have false positives

## License & Attribution
- Project licensed under MIT License. 
- All dependencies use permissive open-source licenses (MIT, Apache 2.0, BSD)
- APIs used under appropriate licenses from Aura Network, Moralis, Alchemy, CoinGecko, and Etherscan

## Project Information
- **Author**: dev0xhog
- **Primary APIs**: Aura Portfolio Balances API, Aura Portfolio Strategies API

*Built for the AURA Hackathon | Showcasing the power of Aura's Portfolio APIs for multi-chain intelligence*
