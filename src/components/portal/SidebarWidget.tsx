import { Link } from "react-router-dom";

interface TrendingItem {
  id: string;
  title: string;
  category: string;
}

const RANK_TONES = [
  "text-rank-1",
  "text-rank-2",
  "text-rank-3",
  "text-rank-4",
];

export function TrendingWidget({ items }: { items: TrendingItem[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <h3 className="font-serif font-semibold text-lg">Em Alta</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <Link key={item.id} to={`/artigo/${item.id}`} className="group flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground">
            <span className={`text-2xl font-serif font-bold ${RANK_TONES[Math.min(i, RANK_TONES.length - 1)]}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-accent dark:group-hover:text-foreground group-hover:underline transition-colors line-clamp-2">{item.title}</p>
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
      <p className="text-sm text-primary-foreground/90 mb-4">
        Assine e receba as últimas atualizações diretamente no seu email.
      </p>
      <input
        type="email"
        placeholder="Seu email"
        className="w-full px-3 py-2 rounded-md bg-transparent border border-primary-foreground/60 text-sm text-primary-foreground placeholder:text-primary-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary mb-3"
      />
      <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
        Assinar
      </button>
    </div>
  );
}

const COUNT_BANDS = [
  { max: 3, className: "bg-count-1 text-count-1-foreground border-count-1-foreground" },
  { max: 9, className: "bg-count-2 text-count-2-foreground border-count-2 font-semibold" },
  { max: 19, className: "bg-count-3 text-count-3-foreground border-count-3 font-semibold" },
  { max: Infinity, className: "bg-count-4 text-count-4-foreground border-count-4 font-semibold" },
];

function countClassFor(count: number) {
  return (COUNT_BANDS.find((band) => count <= band.max) ?? COUNT_BANDS[0]).className;
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function CategoriesWidget({ categories }: { categories: { name: string; count: number }[] }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h3 className="font-serif font-semibold text-lg mb-4">Categorias</h3>
      <div className="space-y-2">
        {categories.map((cat) => {
          const slug = toSlug(cat.name);
          return (
            <Link
              key={cat.name}
              to={`/categoria/${slug}`}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <span className="text-sm group-hover:text-accent dark:group-hover:text-foreground group-hover:underline transition-colors">{cat.name}</span>
              <span
                className={`text-xs min-w-6 text-center tabular-nums border px-2 py-0.5 rounded-full transition-all ${countClassFor(cat.count)}`}
              >
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
