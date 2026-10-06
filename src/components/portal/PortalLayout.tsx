import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoWhite from "@/assets/logo-white.png";
import logoImg from "@/assets/logo.png";

const NAV_ITEMS = [
  { name: "Início", path: "/" },
  { name: "Notícias", path: "/categoria/noticias" },
  { name: "Tecnologia", path: "/categoria/tecnologia" },
  { name: "Institucional", path: "/categoria/institucional" },
  { name: "Eventos", path: "/categoria/eventos" },
  { name: "Recursos", path: "/categoria/recursos" },
  { name: "Sobre", path: "/sobre" },
];

const FOOTER_NAV = ["/", "/categoria/noticias", "/categoria/tecnologia", "/sobre"];
const FOOTER_CATEGORIES = ["/categoria/institucional", "/categoria/eventos", "/categoria/recursos"];

const DEFAULT_TITLE = "TechIn - Portal Institucional";
const WRAP ="mx-auto w-full max-w-[1200px] px-4 sm:px-6";
const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring";
const FOCUS_ON_DARK =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brand-blue";
const ROUND_BUTTON =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-input bg-transparent text-foreground transition-colors hover:bg-muted";

const itemsByPath = (paths: string[]) => NAV_ITEMS.filter((item) => paths.includes(item.path));

export function PortalLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  useEffect(() => {
    const current = NAV_ITEMS.find((item) => item.path !== "/" && isActive(item.path));
    document.title = current ? `${current.name} - TechIn` : DEFAULT_TITLE;
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-primary-foreground focus:outline focus:outline-[3px] focus:outline-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="bg-topbar text-topbar-foreground">
        <div className={`${WRAP} flex justify-end py-1.5 text-xs`}>
          <Link to="/admin" className={`rounded-sm hover:underline ${FOCUS_ON_DARK}`}>
            Área Admin
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className={WRAP}>
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <Link to="/" aria-label="TechIn, página inicial" className={`flex items-center rounded-sm ${FOCUS}`}>
              <img src={logoImg} alt="" className="h-[46px] w-auto object-contain dark:hidden" />
              <img src={logoWhite} alt="" className="hidden h-10 w-auto object-contain dark:block" />
            </Link>

            <nav aria-label="Principal" className="hidden lg:block">
              <ul className="flex gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        aria-current={active ? "page" : undefined}
                        className={`relative block rounded-lg px-3 py-2 text-[0.9rem] transition-colors hover:bg-muted ${FOCUS} ${
                          active
                            ? "font-bold text-primary after:absolute after:inset-x-3 after:bottom-0.5 after:h-[3px] after:rounded-[3px] after:bg-gradient-to-r after:from-brand-blue after:to-primary"
                            : "font-medium"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle className="max-sm:hidden" />
              <Link to="/busca" aria-label="Pesquisar no portal" className={`${ROUND_BUTTON} ${FOCUS}`}>
                <Search size={18} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="menu-mobile"
                aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                className={`${ROUND_BUTTON} lg:hidden ${FOCUS}`}
              >
                {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav id="menu-mobile" aria-label="Principal" className="mt-2 animate-fade-in border-t border-border pb-4 pt-2 lg:hidden">
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive(item.path) ? "page" : undefined}
                      className={`block rounded-lg px-4 py-2 hover:bg-muted ${FOCUS} ${
                        isActive(item.path) ? "font-bold text-primary" : "font-medium"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ThemeToggle className="mt-3 w-full sm:hidden" />
            </nav>
          )}
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer className="mt-auto bg-footer text-footer-foreground">
        <div className={`${WRAP} grid gap-8 pb-8 pt-12 md:grid-cols-[1.4fr_1fr_1fr]`}>
          <div>
            <img src={logoWhite} alt="TechIn" className="mb-3.5 h-11 w-auto object-contain" />
            <p className="max-w-[44ch] text-[0.9rem]">
              Plataforma pública e interativa, projeto extensionista dos alunos de Design de Mídias Digitais da Fatec Carapicuíba.
            </p>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-base text-footer-foreground">Navegação</h2>
            <ul className="space-y-2 text-[0.9rem]">
              {itemsByPath(FOOTER_NAV).map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={`rounded-sm hover:text-footer-foreground hover:underline ${FOCUS_ON_DARK}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-base text-footer-foreground">Categorias</h2>
            <ul className="space-y-2 text-[0.9rem]">
              {itemsByPath(FOOTER_CATEGORIES).map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={`rounded-sm hover:text-footer-foreground hover:underline ${FOCUS_ON_DARK}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="border-t border-footer-foreground/20 pt-[18px] text-[0.8125rem] md:col-span-3">
            © {new Date().getFullYear()} TechIn · Tópicos Especiais em Mídias Digitais — DMD Fatec Carapicuíba
          </p>
        </div>
      </footer>
    </div>
  );
}
