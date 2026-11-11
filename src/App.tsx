import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { ProtectedAdmin } from "@/components/admin/ProtectedAdmin";
import Home from "./pages/Home";
import Article from "./pages/Article";
import Video from "./pages/Video";
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
import AdminUsers from "./pages/admin/AdminUsers";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="techin-theme">
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
              <Route index element={<ProtectedAdmin adminOnly><AdminOverview /></ProtectedAdmin>} />
              <Route path="articles" element={<AdminArticles />} />
              <Route path="videos" element={<ProtectedAdmin adminOnly><AdminVideos /></ProtectedAdmin>} />
              <Route path="categories" element={<ProtectedAdmin adminOnly><AdminCategories /></ProtectedAdmin>} />
              <Route path="authors" element={<ProtectedAdmin adminOnly><AdminAuthors /></ProtectedAdmin>} />
              <Route path="users" element={<ProtectedAdmin adminOnly><AdminUsers /></ProtectedAdmin>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
