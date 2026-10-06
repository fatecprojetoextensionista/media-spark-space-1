import type { FormEvent } from "react";
import { Link } from "react-router-dom";

interface TrendingItem {
  id: string;
  title: string;
  category: string;
  views?: number;
}

const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring";
const WIDGET = "rounded-[14px] border border-border bg-card p-5";
const WIDGET_TITLE =
  "mb-3.5 flex items-center gap-2.5 font-serif text-lg font-semibold before:h-[9px] before:w-[9px] before:shrink-0 before:rotate-45 before:bg-gradient-to-br before:from-brand-blue before:to-primary";

const formatViews = (views: number) => `${views.toLocaleString("pt-BR")} ${views === 1 ? "acesso" : "acessos"}`;

const LoadingText = () => (
  <p role="status" className="text-sm text-muted-foreground">
    Carregando…
  </p>
);

export function TrendingWidget({ items, loading = false }: { items: TrendingItem[]; loading?: boolean }) {
  return (
    <section className={WIDGET} aria-labelledby="titulo-em-alta">
      <h2 id="titulo-em-alta" className={WIDGET_TITLE}>
        Em Alta
      </h2>
      {loading ? (
        <LoadingText />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum artigo em alta por enquanto.</p>
      ) : (
        <ol>
          {items.map((item, i) => (
            <li key={item.id} className="border-b border-border last:border-0">
              <Link
                to={`/artigo/${item.id}`}
                className={`group flex gap-3.5 py-3 ${FOCUS}`}
              >
                <span aria-hidden="true" className="min-w-6 font-serif text-[1.75rem] font-bold leading-none text-primary">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[0.9375rem] font-semibold leading-snug underline-offset-[3px] group-hover:underline">
                    {item.title}
                  </span>
                  <span className="text-[0.8125rem] text-muted-foreground">
                    {item.category}
                    {item.views !== undefined && item.views > 0 && ` · ${formatViews(item.views)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function NewsletterWidget() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section
      className="rounded-[14px] bg-[linear-gradient(135deg,hsl(var(--topbar))_0%,hsl(var(--primary))_130%)] p-5 text-primary-foreground"
      aria-labelledby="titulo-newsletter"
    >
      <h2
        id="titulo-newsletter"
        className="mb-3.5 flex items-center gap-2.5 font-serif text-lg font-semibold before:h-[9px] before:w-[9px] before:shrink-0 before:rotate-45 before:bg-brand-blue-soft"
      >
        Newsletter
      </h2>
      <p className="mb-3.5 text-[0.9375rem] text-topbar-foreground">
        Assine e receba as últimas atualizações diretamente no seu e-mail.
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Seu e-mail
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Seu e-mail"
          className="mb-2.5 h-11 w-full rounded-[10px] border border-primary-foreground bg-primary-foreground/[0.08] px-3 text-primary-foreground placeholder:text-topbar-foreground focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brand-blue-soft"
        />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-brand-blue font-bold text-foreground hover:brightness-110 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-brand-blue-soft"
        >
          Assinar
        </button>
      </form>
    </section>
  );
}

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function CategoriesWidget({
  categories,
  loading = false,
}: {
  categories: { name: string; count: number }[];
  loading?: boolean;
}) {
  return (
    <section className={WIDGET} aria-labelledby="titulo-categorias">
      <h2 id="titulo-categorias" className={WIDGET_TITLE}>
        Categorias
      </h2>
      {loading ? (
        <LoadingText />
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma categoria disponível.</p>
      ) : (
        <ul>
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                to={`/categoria/${toSlug(cat.name)}`}
                className={`group flex items-center justify-between rounded-lg px-2 py-2.5 text-[0.9375rem] transition-colors hover:bg-muted ${FOCUS}`}
              >
                <span className="underline-offset-[3px] group-hover:underline">{cat.name}</span>
                <span className="min-w-8 rounded-full bg-chip px-2.5 py-0.5 text-center text-[0.8125rem] font-bold tabular-nums text-chip-foreground">
                  {cat.count}
                  <span className="sr-only"> {cat.count === 1 ? "artigo" : "artigos"}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
