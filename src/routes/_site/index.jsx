import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ImagePlus, PencilRuler, Search, Sparkles, X } from "lucide-react";
import { CATALOG, MASTERPIECES, TIERS, tierOf } from "@/data/paintings/catalog";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import PixelCover from "@/components/PixelCover";
import { loadProgressIndex } from "@/lib/progressStore";
import { cn } from "@/lib/utils";

const PAGE = 24;

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Pixel & Pigment — Color by Number Studio" },
      {
        name: "description",
        content:
          "Paint real masterpieces from the world's museums, square by square — a thousand paintings by Van Gogh, Monet, Hokusai and more, searchable by title or artist.",
      },
    ],
  }),
  component: HomePage,
});

function Stat({ value, label }) {
  return (
    <div className="border-l border-border/70 pl-4 first:border-l-0 first:pl-0">
      <dt className="font-display text-[26px] leading-none tracking-tight text-foreground">{value}</dt>
      <dd className="mt-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dd>
    </div>
  );
}

function HomePage() {
  const [progress, setProgress] = useState({});
  const [tier, setTier] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    setProgress(loadProgressIndex());
  }, []);

  const filtered = useMemo(() => {
    const pool =
      tier === "all"
        ? CATALOG
        : tier === "masterpieces"
          ? MASTERPIECES
          : tier === "completed"
            ? CATALOG.filter((artwork) => (progress[artwork.slug] || 0) >= 100)
            : CATALOG.filter((artwork) => tierOf(artwork.grid_size) === tier);

    const needle = query.trim().toLowerCase();
    if (!needle) return pool;
    return pool.filter(
      (artwork) =>
        artwork.title.toLowerCase().includes(needle) || (artwork.artist || "").toLowerCase().includes(needle)
    );
  }, [tier, progress, query]);

  const visible = filtered.slice(0, limit);
  const inProgress = CATALOG.filter((artwork) => {
    const p = progress[artwork.slug] || 0;
    return p > 0 && p < 100;
  });

  const heroLeft = MASTERPIECES[0];
  const heroRight = MASTERPIECES[1];
  const largest = Math.max(...CATALOG.map((artwork) => artwork.grid_size));

  const chooseTier = (key) => {
    setTier(key);
    setLimit(PAGE);
  };

  const search = (value) => {
    setQuery(value);
    setLimit(PAGE);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="cbn-rise">
              <span className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                <span className="h-px w-8 bg-[hsl(var(--gold))]" />
                The colour-by-number studio
              </span>
              <h1 className="mt-7 font-display text-[2.7rem] leading-[1.02] tracking-[-0.01em] text-foreground sm:text-5xl lg:text-[3.7rem]">
                Paint the masters,
                <br />
                <em className="italic text-primary">one square</em> at a time.
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                A quiet studio for slow evenings. Bring Van Gogh and Hokusai back to life, or wander through a thousand
                works — from a postcard to a grand {largest}-square wall.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[0_18px_34px_-20px_hsl(20_50%_25%)] transition-all hover:bg-primary/90 active:scale-[0.98]"
                >
                  Create your own map
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#collection"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-white"
                >
                  Browse the collection
                </a>
              </div>

              <dl className="mt-12 flex gap-6">
                <Stat value={String(CATALOG.length)} label="works to paint" />
                <Stat value={`${largest}²`} label="largest canvas" />
                <Stat value="∞" label="your own maps" />
              </dl>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[27rem]">
              <div className="absolute left-0 top-8 rotate-[-7deg] rounded-[1.6rem] border border-white/80 bg-white p-2.5 shadow-[0_36px_70px_-34px_hsl(28_32%_20%/0.55)] transition-transform duration-500 hover:rotate-[-4deg]">
                <PixelCover
                  grid={heroLeft?.target_grid}
                  palette={heroLeft?.palette}
                  className="h-52 w-52 rounded-[1.1rem] sm:h-60 sm:w-60"
                />
              </div>
              <div className="absolute bottom-2 right-0 rotate-[6deg] rounded-[1.6rem] border border-white/80 bg-white p-2.5 shadow-[0_36px_70px_-34px_hsl(28_32%_20%/0.55)] transition-transform duration-500 hover:rotate-[3deg]">
                <PixelCover
                  grid={heroRight?.target_grid}
                  palette={heroRight?.palette}
                  className="h-44 w-44 rounded-[1.1rem] sm:h-52 sm:w-52"
                />
              </div>
              <span className="absolute bottom-24 left-1 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
                {heroLeft?.artist || "Vincent van Gogh"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Continue painting */}
      {inProgress.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-4 pt-2">
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Pick up where you left off</p>
              <p className="mt-1.5 font-display text-lg tracking-tight">
                {inProgress.length === 1 ? "One canvas is waiting" : `${inProgress.length} canvases are waiting`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {inProgress.slice(0, 3).map((artwork) => (
                <Link
                  key={artwork.slug}
                  to="/studio/$artworkId"
                  params={{ artworkId: artwork.slug }}
                  className="flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: artwork.palette?.[0] }} />
                  {artwork.title}
                  <span className="text-muted-foreground">{progress[artwork.slug]}%</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Collection */}
      <section id="collection" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              <span className="h-px w-8 bg-[hsl(var(--gold))]" />
              The collection
            </span>
            <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-[2.6rem]">
              {CATALOG.length} works, square by square
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Each canvas stays under wraps until you finish it. Your progress saves itself as you paint.
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {TIERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => chooseTier(option.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[12.5px] transition-colors",
                  tier === option.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-white/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => search(event.target.value)}
              placeholder="Search a painting or an artist"
              aria-label="Search the collection"
              className="w-full rounded-full border border-border bg-white/70 py-2.5 pl-10 pr-10 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-primary/45 focus:bg-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => search("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {query.trim()
            ? `${filtered.length} ${filtered.length === 1 ? "match" : "matches"} for “${query.trim()}”`
            : `Showing ${Math.min(visible.length, filtered.length)} of ${filtered.length}`}
        </p>

        {visible.length === 0 && (
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            {query.trim() ? (
              <>
                <p className="font-display text-lg tracking-tight">No paintings match “{query.trim()}”</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Try an artist — Van Gogh, Monet, Hokusai — or clear the search to see the whole collection.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-lg tracking-tight">Nothing completed yet</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Finish a canvas and it will be tagged Completed right here.
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((artwork) => (
            <ArtworkCard key={artwork.slug} artwork={artwork} percent={progress[artwork.slug] || 0} />
          ))}
        </div>

        {filtered.length > visible.length && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((value) => value + PAGE)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-white"
            >
              Show more works
              <span className="text-muted-foreground">{filtered.length - visible.length} left</span>
            </button>
          </div>
        )}
      </section>

      {/* Create band */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card p-6 soft-shadow sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">Make it yours</span>
              <h2 className="mt-3 font-display text-2xl tracking-tight sm:text-[2rem]">
                Your own masterpiece starts here
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Drop in a photo and we will turn it into a numbered puzzle, or draw a tiny pixel artwork from a blank
                canvas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[26rem]">
              <Link
                to="/create"
                className="group rounded-[1.25rem] border border-border/80 bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5DCD3] text-primary">
                  <ImagePlus className="h-4 w-4" />
                </span>
                <p className="mt-4 font-display text-base tracking-tight">From an image</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Upload a JPG or PNG and choose your grid and colours.
                </p>
              </Link>
              <Link
                to="/designer"
                className="group rounded-[1.25rem] border border-border/80 bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4EDE0] text-[#3E5B3B]">
                  <PencilRuler className="h-4 w-4" />
                </span>
                <p className="mt-4 font-display text-base tracking-tight">From scratch</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Draw pixel by pixel, then play it as a puzzle.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}