import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import PixelCover from "@/components/PixelCover";
import useArtworkPreview from "@/hooks/useArtworkPreview";
import { cn } from "@/lib/utils";

const DIFFICULTY = {
  easy: "bg-[#E4EDE0]/90 text-[#3E5B3B]",
  medium: "bg-[#F6E8CC]/90 text-[#7A5A22]",
  hard: "bg-[#F5DCD3]/90 text-[#8C3E23]",
};

export default function ArtworkCard({ artwork, percent = 0, badge }) {
  const completed = percent >= 100;
  const id = artwork.id || artwork.slug;
  const { ref, grid, palette } = useArtworkPreview(artwork);

  return (
    <Link
      to="/studio/$artworkId"
      params={{ artworkId: id }}
      className="group relative flex flex-col rounded-[1.6rem] border border-border/60 bg-card p-2.5 transition-all duration-300 hover:-translate-y-1 hover:border-[hsl(var(--gold)/0.45)] hover:shadow-[0_30px_60px_-38px_hsl(28_30%_18%/0.55)]"
    >
      <div
        ref={ref}
        className="relative aspect-square overflow-hidden rounded-[1.2rem] bg-[#F4EFE6] ring-1 ring-black/[0.04]"
      >
        {grid ? (
          <PixelCover
            grid={grid}
            palette={palette}
            className={cn(
              "h-full w-full transition-all duration-500",
              completed ? "" : "scale-[1.05] opacity-85 blur-[2.5px] grayscale-[0.75] group-hover:blur-[1.5px] group-hover:grayscale-[0.6]"
            )}
          />
        ) : (
          <div className="h-full w-full animate-pulse bg-gradient-to-br from-[#F0E7D8] via-[#EADFCD] to-[#F0E7D8]" />
        )}

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          {artwork.difficulty && (
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] backdrop-blur",
                DIFFICULTY[artwork.difficulty] || DIFFICULTY.medium
              )}
            >
              {artwork.difficulty}
            </span>
          )}
          <span className="rounded-full bg-white/85 px-2 py-1 text-[10px] font-medium tabular-nums text-muted-foreground backdrop-blur">
            {artwork.grid_size}×{artwork.grid_size}
          </span>
        </div>

        {badge && !completed && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-white/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
            {badge}
          </span>
        )}

        {completed ? (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#3E5B3B] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
            <Check className="h-3 w-3" /> Completed
          </span>
        ) : (
          <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            Finish to reveal
          </span>
        )}
      </div>

      <div className="px-2 pb-1.5 pt-4">
        <h3 className="font-display text-[17px] leading-tight tracking-tight">{artwork.title}</h3>
        <p className="mt-1.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {artwork.artist}
          {artwork.year ? ` · ${artwork.year}` : ""}
        </p>

        {percent > 0 && !completed && (
          <div className="mt-3">
            <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{percent}% painted</p>
          </div>
        )}
      </div>
    </Link>
  );
}