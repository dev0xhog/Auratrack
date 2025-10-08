import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Crypto Portfolio Tracker',
  projectId: '0e9a5213fbf07b17c0e3ca0a72aa58a6',
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
