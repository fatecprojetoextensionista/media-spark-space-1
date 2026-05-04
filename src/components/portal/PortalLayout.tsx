// ... (mantenha os imports iguais acima)
import logoPortal from "@/assets/logo-portal.png"; 

export function PortalLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
              <span>📍 Av. Francisco Pignatari, 650 - Carapicuíba - SP</span>
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
          <div className="flex justify-between items-center h-24"> {/* Aumentei para h-24 para dar destaque à logo */}
            <Link to="/" className="flex items-center group">
              {/* LOGO SOZINHA E MAIOR */}
              <img 
                src={logoPortal} 
                alt="Logo" 
                className="h-16 w-auto object-contain transition-transform group-hover:scale-105" 
              />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                {/* Logo no footer também sozinha */}
                <img src={logoPortal} alt="Logo" className="h-12 w-auto object-contain brightness-0 invert" />
              </div>
              <p className="text-sm text-primary-foreground/70">
                Portal institucional para divulgação de notícias, artigos, vídeos e recursos.
              </p>
            </div>
            {/* ... restante do footer ... */}
          </div>
        </div>
      </footer>
    </div>
  );
}
