import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { ProtectedAdmin } from "@/components/admin/ProtectedAdmin";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Video from "./pages/Video"; // <--- IMPORTANTE: Importamos a nova página de vídeo
import AdminAuthors from "./pages/admin/AdminAuthors";
import Category from "./pages/Category";
import SearchPage from "./pages/SearchPage";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminCategories from "./pages/admin/AdminCategories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PortalLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/artigo/:id" element={<Article />} />
              {/* ROTA CORRIGIDA: Agora aponta para o componente Video em vez de Article */}
              <Route path="/video/:id" element={<Video />} /> 
              <Route path="/categoria/:name" element={<Category />} />
              <Route path="/busca" element={<SearchPage />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdmin>
                  <AdminLayout />
                </ProtectedAdmin>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
