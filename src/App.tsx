import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalLayout } from "@/components/portal/PortalLayout";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Category from "./pages/Category";
import SearchPage from "./pages/SearchPage";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<PortalLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/artigo/:id" element={<Article />} />
            <Route path="/categoria/:name" element={<Category />} />
            <Route path="/busca" element={<SearchPage />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/configuracoes" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
