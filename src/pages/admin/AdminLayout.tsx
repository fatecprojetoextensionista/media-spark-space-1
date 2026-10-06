import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Video, FolderTree, LogOut, Home, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoImg1 from "@/assets/logo-C7WwK5gX.png";
import logoWhite from "@/assets/logo-white.png";

const links = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/articles", label: "Artigos", icon: FileText },
  { to: "/admin/videos", label: "Vídeos", icon: Video },
  { to: "/admin/categories", label: "Categorias", icon: FolderTree },
  { to: "/admin/authors", label: "Autores", icon: UserCheck },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="sticky top-0 h-screen w-60 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border shrink-0">
          <Link to="/" className="flex items-center mb-1">
            <img src={logoImg1} alt="Logótipo do Portal" className="h-8 w-auto object-contain dark:hidden" />
            <img src={logoWhite} alt="Logótipo do Portal" className="hidden h-8 w-auto object-contain dark:block" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2">Admin</p>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
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
        <div className="p-3 border-t border-border space-y-2 shrink-0">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Home size={14} /> Ver portal
          </Link>
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          <ThemeToggle className="w-full" />
          <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
            <LogOut size={14} className="mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
