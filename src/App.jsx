import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CommProvider } from "@/context/CommContext";
import { SurveillanceProvider } from "@/context/SurveillanceContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CommProvider>
          <SurveillanceProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />}/>
                <Route path="*" element={<NotFound />}/>
              </Routes>
            </BrowserRouter>
          </SurveillanceProvider>
        </CommProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;
