import { Link } from "react-router-dom";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  featured?: boolean;
}

export function ArticleCard({ id, title, excerpt, category, author, date, imageUrl, featured }: ArticleCardProps) {
  return (
    <Link to={`/artigo/${id}`} className="group block h-full">
      <article className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col ${featured ? 'md:grid md:grid-cols-2' : ''}`}>
        <div className={`bg-muted overflow-hidden ${featured ? 'aspect-video md:aspect-auto md:h-full' : 'aspect-video'}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📰</span>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">{category}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <h3 className={`font-serif font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{excerpt}</p>
          
          {/* Bolinha do autor removida! Agora exibe apenas o texto, empurrado para o final da div */}
          <div className="mt-auto pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Por {author}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}import { Link } from "react-router-dom";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl?: string;
  featured?: boolean;
}

export function ArticleCard({ id, title, excerpt, category, author, date, imageUrl, featured }: ArticleCardProps) {
  return (
    <Link to={`/artigo/${id}`} className="group block">
      <article className={`bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full ${featured ? 'md:grid md:grid-cols-2' : ''}`}>
        <div className={`bg-muted overflow-hidden ${featured ? 'aspect-video md:aspect-auto md:h-full' : 'aspect-video'}`}>
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📰</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">{category}</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <h3 className={`font-serif font-semibold text-foreground group-hover:text-accent transition-colors mb-2 line-clamp-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {author.charAt(0)}
            </div>
            <span className="text-xs text-muted-foreground">{author}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
