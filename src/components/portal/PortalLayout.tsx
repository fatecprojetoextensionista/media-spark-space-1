import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";

// Lista de categorias normalizada para facilitar a manutenção
const categories = [
  { name: "Notícias", path: "/categoria/noticias" },
  { name: "Tecnologia", path: "/categoria/tecnologia" },
  { name: "Institucional", path: "/categoria/institucional" },
  { name: "Eventos", path: "/categoria/eventos" },
  { name: "Recursos", path: "/categoria/recursos" },
];

export function PortalLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // UX: Função para destacar o link ativo no menu
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-primary-foreground/80 text-xs py-2">
            <div className="flex gap-4">
              <span>📧Av. Francisco Pignatari, 650 - Vila Gustavo Correia, Carapicuíba - SP, 06310-390</span>
              <span className="hidden sm:inline">📞 (11) 4185-6600</span>
            </div>
            <div className="flex gap-4">
              <Link to="/sobre" className="hover:text-primary-foreground transition-colors">Sobre</Link>
              <Link to="/admin" className="hover:text-primary-foreground transition-colors">Área Admin</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              {/* Logo nova (3.png) com o tamanho antigo */}
              <img src={logoImg} alt="Portal" className="w-10 h-10 object-contain" />
              <div>
                <div className="text-xl font-serif font-bold text-foreground tracking-tight">PORTAL</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Institucional</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/") && !location.pathname.includes("categoria")
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                Início
              </Link>
              
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(cat.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-md hover:bg-muted transition-colors"
              >
                <Search size={18} />
              </button>
              <Link
                to="/busca"
                className="hidden md:inline-flex px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Pesquisar
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImg} alt="Portal" className="w-8 h-8 object-contain brightness-200" />
                <span className="font-serif font-bold text-lg">PORTAL</span>
              </div>
              <p className="text-sm text-primary-foreground/70">
                Portal institucional para divulgação de notícias, artigos, vídeos e recursos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Categorias</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70 font-sans">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link to={cat.path} className="hover:text-primary-foreground transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
