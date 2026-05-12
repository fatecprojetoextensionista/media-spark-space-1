import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Video, FolderTree, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// Importando a imagem do logótipo para o painel administrativo
import logoImg from "@/assets/logo-C7WwK5gX.png";

const links = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/articles", label: "Artigos", icon: FileText },
  { to: "/admin/videos", label: "Vídeos", icon: Video },
  { to: "/admin/categories", label: "Categorias", icon: FolderTree },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-60 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          {/* Trocado o texto "PORTAL" pelo logótipo */}
          <Link to="/" className="flex items-center mb-1">
            <img src={logoImg} alt="Logótipo do Portal" className="h-8 w-auto object-contain" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Home size={14} /> Ver portal
          </Link>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut size={14} className="mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
