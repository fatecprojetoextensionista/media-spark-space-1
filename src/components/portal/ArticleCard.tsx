import { useId } from "react";
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

const CARD_SHAPES = [
  { gradient: "210,-90 320,20 210,130 100,20", outline: "120,50 180,110 120,170 60,110" },
  { gradient: "90,-50 180,40 90,130 0,40", outline: "230,50 280,100 230,150 180,100" },
  { gradient: "160,-110 280,10 160,130 40,10", outline: "60,70 110,120 60,170 10,120" },
  { gradient: "250,-20 330,60 250,140 170,60", outline: "110,20 180,90 110,160 40,90" },
  { gradient: "60,-70 160,30 60,130 -40,30", outline: "200,55 255,110 200,165 145,110" },
];

const hashSeed = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
};

interface CoverArtProps {
  seed: string;
  variant?: "card" | "hero";
  className?: string;
}

export function CoverArt({ seed, variant = "card", className }: CoverArtProps) {
  const gradientId = `cover-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const gradientStops = (
    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style={{ stopColor: "hsl(var(--brand-blue))" }} />
      <stop offset="1" style={{ stopColor: "hsl(var(--primary))" }} />
    </linearGradient>
  );

  if (variant === "hero") {
    return (
      <svg
        viewBox="0 0 520 420"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
        className={className}
      >
        <defs>
          {gradientStops}
          <linearGradient id={`${gradientId}b`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: "hsl(var(--input))" }} />
            <stop offset="1" style={{ stopColor: "hsl(var(--brand-blue-soft))" }} />
          </linearGradient>
        </defs>
        <rect width="520" height="420" className="fill-topbar" />
        <polygon
          points="300,-40 540,200 300,440 60,200"
          fill="none"
          strokeWidth="4"
          strokeOpacity=".9"
          className="stroke-topbar-foreground"
        />
        <polygon points="330,30 470,170 330,310 190,170" fill={`url(#${gradientId})`} />
        <polygon points="410,250 480,320 410,390 340,320" fill={`url(#${gradientId}b)`} />
        <polygon
          points="120,300 160,340 120,380 80,340"
          fill="none"
          strokeWidth="3"
          strokeOpacity=".8"
          className="stroke-topbar-foreground"
        />
      </svg>
    );
  }

  const shape = CARD_SHAPES[hashSeed(seed) % CARD_SHAPES.length];

  return (
    <svg
      viewBox="0 0 320 180"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>{gradientStops}</defs>
      <rect width="320" height="180" className="fill-topbar" />
      <polygon points={shape.gradient} fill={`url(#${gradientId})`} />
      <polygon
        points={shape.outline}
        fill="none"
        strokeWidth="3"
        strokeOpacity=".9"
        className="stroke-topbar-foreground"
      />
      <polygon points="280,134 296,150 280,166 264,150" fillOpacity=".9" className="fill-brand-blue-soft" />
    </svg>
  );
}

export function ArticleCard({ id, title, excerpt, category, author, date, imageUrl, featured }: ArticleCardProps) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-[transform,box-shadow] duration-200 hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.06),0_8px_24px_hsl(var(--foreground)/0.07)] motion-safe:hover:-translate-y-[3px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-ring ${
        featured ? "md:grid md:grid-cols-2" : ""
      }`}
    >
      <div className={`overflow-hidden bg-muted ${featured ? "aspect-video md:aspect-auto md:h-full" : "aspect-video"}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <CoverArt seed={id} className="h-full w-full" />
        )}
      </div>
      <div className="flex flex-1 flex-col items-start gap-2.5 px-[18px] pb-5 pt-[18px]">
        <span className="inline-block rounded-full bg-chip px-2.5 py-[3px] text-xs font-bold text-chip-foreground">
          {category}
        </span>
        <h3 className={`font-serif font-semibold text-foreground ${featured ? "text-2xl" : "text-lg"}`}>
          <Link
            to={`/artigo/${id}`}
            className="underline-offset-[3px] after:absolute after:inset-0 group-hover:underline focus-visible:outline-none"
          >
            {title}
          </Link>
        </h3>
        {excerpt && <p className="line-clamp-2 text-[0.9375rem] text-muted-foreground">{excerpt}</p>}
        <p className="mt-auto text-[0.8125rem] text-muted-foreground">
          {author}
          {date && ` · ${date}`}
        </p>
      </div>
    </article>
  );
}
