import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { Navbar } from "@/components/layout/Navbar";
import Portfolio from "./pages/Portfolio";
import Strategies from "./pages/Strategies";
import Transactions from "./pages/Transactions";
import NFTs from "./pages/NFTs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/nfts" element={<NFTs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
