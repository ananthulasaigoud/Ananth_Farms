import './i18n'; // Import i18n configuration
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import CropDetail from "./pages/CropDetail";
import LandExpenses from "./pages/LandExpenses";
import AddCrop from "./pages/AddCrop";
import Profile from "./pages/Profile";
import Payments from "./pages/Payments";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import PWAInstallButton from './components/PWAInstallButton';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/crop/:cropId" element={<CropDetail />} />
            <Route path="/land-expenses" element={<LandExpenses />} />
            <Route path="/add-crop" element={<AddCrop />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payments" element={<Payments />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PWAInstallButton />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
