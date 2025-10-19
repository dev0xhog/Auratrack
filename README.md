# Multi-Chain Crypto Portfolio Tracker

A comprehensive, multi-chain cryptocurrency portfolio and transaction tracker built for seamless blockchain data visualization across 18 EVM-compatible networks.

## 🎯 Overview

This application provides users with a unified interface to track their crypto assets, NFTs, transactions, and portfolio performance across multiple blockchain networks. Built with modern web technologies and powered by Moralis API, it offers real-time data aggregation and beautiful visualizations.

## ✨ Key Features

### 📊 Portfolio Dashboard
- **Multi-chain balance tracking** across 18 networks
- **Real-time price data** integration via CoinCap API
- **Portfolio value charts** with historical performance
- **Token holdings table** with detailed metrics
- **24h price changes** and percentage gains/losses
- **Automated portfolio strategies** suggestions

### 💎 NFT Gallery
- **Cross-chain NFT discovery** with automatic metadata fetching
- **Network filtering** to view NFTs by blockchain
- **High-quality image rendering** with lazy loading
- **Collection details** and metadata display
- **Spam NFT filtering** for cleaner galleries

### 🔄 Transaction History
- **Unified transaction view** across all supported chains
- **Smart swap detection** - automatically groups related transactions
- **Transaction categorization** (sent, received, swapped, approved)
- **Network filtering** and search functionality
- **Spam token filtering** with comprehensive security checks
- **Direct blockchain explorer links** for verification

### 🔗 Wallet Integration
- **RainbowKit integration** for smooth wallet connection
- **Support for major wallets**: MetaMask, Coinbase Wallet, WalletConnect, and more
- **Automatic address detection** via URL parameters
- **Multi-wallet support**

## 🌐 Supported Networks

The application supports **18 EVM-compatible chains**:

- Ethereum
- Polygon
- Binance Smart Chain (BSC)
- Avalanche
- Fantom
- Arbitrum
- Optimism
- Base
- Linea
- Cronos
- Gnosis
- Chiliz
- Moonbeam
- Moonriver
- Flow EVM
- Ronin
- Lisk
- Pulsechain

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Blockchain Integration
- **RainbowKit** - Wallet connection UI
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript Ethereum library
- **Moralis API** - Multi-chain blockchain data

### State Management & Data Fetching
- **TanStack Query (React Query)** - Async state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm/bun
- A Moralis API key (get it at [moralis.io](https://moralis.io))

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Add your Moralis API key to `.env`:
```
VITE_MORALIS_API_KEY=your_api_key_here
```

4. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, etc.)
│   ├── nft/            # NFT-specific components
│   ├── portfolio/      # Portfolio dashboard components
│   ├── transactions/   # Transaction view components
│   └── ui/             # shadcn/ui base components
├── hooks/              # Custom React hooks
│   ├── useMoralis*.ts  # Moralis API integration hooks
│   ├── useTokenPrices.ts
│   └── usePortfolio*.ts
├── pages/              # Route pages
│   ├── Landing.tsx     # Home page
│   ├── Portfolio.tsx   # Portfolio dashboard
│   ├── NFTs.tsx        # NFT gallery
│   ├── Transactions.tsx
│   └── Strategies.tsx
├── lib/                # Utility functions
│   ├── formatters.ts   # Number/currency formatters
│   ├── utils.ts        # General utilities
│   └── nftHelpers.ts   # NFT-specific utilities
└── config/             # Configuration files
    └── wagmi.ts        # Wallet connection config
```

## 🎨 Features in Detail

### Smart Transaction Grouping
The transaction view automatically detects and groups related transactions (e.g., swaps) by analyzing transaction hashes and timestamps, providing a cleaner, more intuitive view of your activity.

### Spam Token Filtering
Advanced filtering system that checks:
- Moralis spam detection API
- Token contract verification status
- Security scores
- Unicode character detection (scam tokens)
- Suspicious naming patterns

### Performance Optimizations
- **Parallel API calls** for faster data loading
- **React Query caching** with 5-minute stale time
- **Progressive loading** - show initial results while fetching more
- **Image lazy loading** for NFTs
- **Memoized computations** for heavy data transformations

## 🔐 Security Features

- No private key handling - wallet connection only
- Read-only blockchain data access
- Secure API key management through environment variables
- XSS protection through React's built-in escaping
- Content Security Policy ready

## 🌟 Future Enhancements

- [ ] DeFi protocol integration (staking, lending positions)
- [ ] Portfolio alerts and notifications
- [ ] Historical portfolio snapshots
- [ ] Tax reporting export
- [ ] Social features (share portfolios)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and insights
- [ ] Multi-language support

## 📊 API Rate Limits

The application uses Moralis API which has rate limits. For production use:
- Consider implementing request queuing
- Use the paid Moralis plan for higher limits
- Implement request caching strategies

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [Deploy your app to Lovable](https://lovable.dev/projects/37e29a6c-e689-4201-be81-914c2de6d4bb)
- **Moralis API**: [moralis.io](https://moralis.io)
- **RainbowKit**: [rainbowkit.com](https://rainbowkit.com)
- **shadcn/ui**: [ui.shadcn.com](https://ui.shadcn.com)

## 💬 Support

For questions or support, please [open an issue](https://github.com/yourusername/yourrepo/issues) on GitHub.

---

Built with ❤️ using [Lovable](https://lovable.dev)
