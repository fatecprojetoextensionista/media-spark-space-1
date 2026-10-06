import DOMPurify from "dompurify";

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  categoryName: string | null;
  authorName: string;
  groupAuthors: string;
  authorPhotoUrl: string;
  publishedAt: string | null;
}

const getInitials = (name: string) => {
  if (!name) return "EQ";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function ArticlePreview({
  title,
  excerpt,
  content,
  coverImageUrl,
  categoryName,
  authorName,
  groupAuthors,
  authorPhotoUrl,
  publishedAt,
}: ArticlePreviewProps) {
  const cleanContent = DOMPurify.sanitize(content, { FORBID_TAGS: ["style"] });
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("pt-BR", { dateStyle: "long" })
    : "Data definida ao publicar";
  const hasAuthor = Boolean(authorName || groupAuthors);

  return (
    <div className="bg-card border border-border p-6 sm:p-8 rounded-xl shadow-sm">
      {categoryName && (
        <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-4">
          {categoryName}
        </span>
      )}

      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">
        {title || "Título do artigo"}
      </h2>

      <div className="flex flex-wrap gap-x-2 text-sm text-muted-foreground mb-6 font-sans">
        <span>{date}</span>
      </div>

      {excerpt && (
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-sans italic border-l-4 border-primary/20 pl-4">
          {excerpt}
        </p>
      )}

      {coverImageUrl && (
        <img src={coverImageUrl} alt={title} className="w-full rounded-lg mb-8 shadow-sm" />
      )}

      {cleanContent ? (
        <div
          className="prose prose-lg dark:prose-invert max-w-none text-justify font-sans text-foreground/90"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      ) : (
        <p className="text-muted-foreground font-sans">O conteúdo do artigo aparecerá aqui.</p>
      )}

      {hasAuthor && (
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative text-primary font-bold text-xl">
              {getInitials(authorName || groupAuthors)}
              {authorPhotoUrl && (
                <img src={authorPhotoUrl} alt="Autor" className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
                Autor(es)
              </p>
              <h4 className="text-lg font-bold text-foreground font-serif">
                {authorName}
                {authorName && groupAuthors && " & "}
                {groupAuthors}
              </h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
