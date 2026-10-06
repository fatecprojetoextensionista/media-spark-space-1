import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import heroBg from "@/assets/Fatec.jpeg";

export interface HeroArticle {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  views?: number | null;
}

interface HeroCarouselProps {
  recent: HeroArticle | null;
  popular: HeroArticle | null;
}

interface HeroSlide {
  key: string;
  badge: string;
  title: string;
  image: string;
  href: string;
  views?: number;
}

const AUTOPLAY_MS = 6000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const controlButtonClass =
  "top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/40 bg-slate-900/70 text-white hover:bg-slate-900 hover:text-white focus-visible:ring-white focus-visible:ring-offset-slate-900 disabled:opacity-60";
const formatViews = (views: number) => `${views.toLocaleString("pt-BR")} ${views === 1 ? "acesso" : "acessos"}`;
const NO_NAVIGATION = { disabled: true, "aria-hidden": true } as const;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(REDUCED_MOTION_QUERY).matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface HeroImageProps {
  src: string;
  zoomed: boolean;
}

function HeroImage({ src, zoomed }: HeroImageProps) {
  return (
    <img
      src={src}
      alt=""
      className={cn(
        "h-full w-full origin-center object-cover transition-transform duration-700 ease-out will-change-transform",
        zoomed ? "scale-110" : "scale-100",
      )}
    />
  );
}

export function HeroCarousel({ recent, popular }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const slides = useMemo<HeroSlide[]>(() => {
    const list: HeroSlide[] = [
      {
        key: "welcome",
        badge: "BEM-VINDO",
        title: "Bem-vindo ao Portal Institucional TechIn",
        image: heroBg,
        href: "/sobre",
      },
    ];
    if (recent) {
      list.push({
        key: `recent-${recent.id}`,
        badge: "MAIS RECENTE",
        title: recent.title,
        image: recent.cover_image_url || heroBg,
        href: `/artigo/${recent.slug}`,
      });
    }
    if (popular) {
      list.push({
        key: `popular-${popular.id}`,
        badge: "DESTAQUE",
        title: popular.title,
        image: popular.cover_image_url || heroBg,
        href: `/artigo/${popular.slug}`,
        views: popular.views ?? 0,
      });
    }
    return list;
  }, [recent, popular]);

  const total = slides.length;
  const autoplayActive = total > 1 && !hoverPaused && !focusPaused &&!reducedMotion;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.reInit();
  }, [api, total]);

  useEffect(() => {
    if (!api || !autoplayActive) return;
    const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [api, autoplayActive, selected]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false);
  }, []);

  return (
    <>
      <h1 className="sr-only">Portal Institucional TechIn</h1>
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        aria-label="Destaques do portal"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHoverPaused(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHoverPaused(false);
        }}
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setFocusPaused(true);
        }}
        onBlur={handleBlur}
      >
        <CarouselContent className="ml-0" aria-live={autoplayActive ? "off" : "polite"}>
          {slides.map((slide, index) => {
            const active = index === selected;
            return (
              <CarouselItem
                key={slide.key}
                className="pl-0"
                aria-label={total > 1 ? `${index + 1} de ${total}` : undefined}
                aria-hidden={!active}
              >
                <div className="relative flex h-full min-h-[400px] items-end overflow-hidden pb-16 pt-8">
                  <div className="absolute inset-0">
                    <HeroImage src={slide.image} zoomed={active && hoverPaused && !reducedMotion} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-hero-overlay via-hero-overlay/75 to-hero-overlay/20" />
                  <div className="relative max-w-7xl mx-auto px-16 md:px-20 2xl:px-8 w-full">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-chip text-chip-foreground text-xs font-bold rounded-full tracking-wider">
                        <span className="h-2.5 w-2.5 shrink-0 rotate-45 bg-gradient-to-br from-brand-blue to-primary" aria-hidden="true" />
                        {slide.badge}
                      </div>
                      {slide.views !== undefined && slide.views > 0 && (
                        <p className="flex items-center gap-1.5 rounded-full bg-chip px-3 py-1 text-xs font-semibold text-chip-foreground">
                          <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>Mais acessado · {formatViews(slide.views)}</span>
                        </p>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-white max-w-2xl leading-tight break-words">
                      <Link
                        to={slide.href}
                        tabIndex={active ? 0 : -1}
                        className="rounded-sm underline-offset-4 decoration-2 hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      >
                        {slide.title}
                        <ArrowRight className="ml-2 inline-block h-6 w-6 align-[-0.1em] md:h-7 md:w-7" aria-hidden="true" />
                      </Link>
                    </h2>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious
          aria-label="Slide anterior"
          {...(total < 2 ? NO_NAVIGATION : {})}
          className={cn(controlButtonClass, "left-2 md:left-4")}
        />
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center"
          aria-hidden={total < 2 ? true : undefined}
        >
          {total < 2 && (
            <span className="flex h-6 w-6 items-center justify-center">
              <span className="block h-2.5 w-2.5 rounded-full border border-white bg-white" />
            </span>
          )}
          {total > 1 && slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`Ir para o slide ${index + 1} de ${total}`}
              aria-current={index === selected ? "true" : undefined}
              onClick={() => api?.scrollTo(index)}
              className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full border border-white transition-colors",
                  index === selected ? "bg-white" : "bg-transparent group-hover:bg-white/60",
                )}
              />
            </button>
          ))}
        </div>
        <CarouselNext
          aria-label="Próximo slide"
          {...(total < 2 ? NO_NAVIGATION : {})}
          className={cn(controlButtonClass, "right-2 md:right-4")}
        />
      </Carousel>
    </>
  );
}
