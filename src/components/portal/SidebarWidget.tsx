import { Link } from "react-router-dom";

interface TrendingItem {
  id: string;
  title: string;
  category: string;
}

export function TrendingWidget({ items }: { items: TrendingItem[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <h3 className="font-serif font-semibold text-lg">Em Alta</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <Link key={item.id} to={`/artigo/${item.id}`} className="group flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <span className="text-2xl font-serif font-bold text-muted-foreground/40">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">{item.title}</p>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function NewsletterWidget() {
  return (
    <div className="bg-primary rounded-lg p-5 text-primary-foreground">
      <h3 className="font-serif font-semibold text-lg mb-2">Newsletter</h3>
      <p className="text-sm text-primary-foreground/70 mb-4">
        Assine e receba as últimas atualizações diretamente no seu email.
      </p>
      <input
        type="email"
        placeholder="Seu email"
        className="w-full px-3 py-2 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent mb-3"
      />
      <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
        Assinar
      </button>
    </div>
  );
}

export function CategoriesWidget({ categories }: { categories: { name: string; count: number }[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="font-serif font-semibold text-lg mb-4">Categorias</h3>
      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            /* 
               Aqui está a mágica: 
               .toLowerCase() deixa tudo minúsculo (Notícias -> notícias)
               .normalize("NFD").replace(/[\u0300-\u036f]/g, "") remove os acentos (notícias -> noticias)
            */
            to={`/categoria/${cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
            className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group"
          >
            <span className="text-sm group-hover:text-accent transition-colors">{cat.name}</span>
            <span className="text-xs text-muted-foreground bg-muted group-hover:bg-accent/10 group-hover:text-accent px-2 py-0.5 rounded-full transition-all">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
