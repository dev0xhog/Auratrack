import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "./config/wagmi";
import { Navbar } from "@/components/layout/Navbar";
import Landing from "./pages/Landing";
import Portfolio from "./pages/Portfolio";
import Strategies from "./pages/Strategies";
import Transactions from "./pages/Transactions";
import NFTs from "./pages/NFTs";
import NotFound from "./pages/NotFound";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen w-full bg-background">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/*"
                    element={
                      <>
                        <Navbar />
                        <Routes>
                          <Route path="/portfolio" element={<Portfolio />} />
                          <Route path="/strategies" element={<Strategies />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/nfts" element={<NFTs />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </>
                    }
                  />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider>
);

export default App;
