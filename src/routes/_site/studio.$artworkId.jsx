import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { artworkStore } from "@/lib/localStore";
import { findWork } from "@/data/paintings/catalog";
import { buildPainting } from "@/lib/museumPaintings";
import { loadFullGrid } from "@/lib/mapStore";
import StudioSession from "@/components/studio/StudioSession";

export const Route = createFileRoute("/_site/studio/$artworkId")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Painting studio — Pixel & Pigment" }],
  }),
  component: StudioPage,
});

function StudioPage() {
  const { artworkId } = Route.useParams();
  const [artwork, setArtwork] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");

    (async () => {
      // the collection lives in the app: the hand-painted masterpieces carry
      // their grid, and a museum painting is turned into one from its image
      const curated = findWork(artworkId);
      if (curated) {
        try {
          const full = curated.target_grid ? curated : await buildPainting(curated);
          if (!alive) return;
          setArtwork({ ...full, id: full.slug });
          setState("ready");
        } catch {
          if (alive) setState("missing");
        }
        return;
      }

      try {
        const record = await artworkStore.get(artworkId);
        if (!alive) return;
        const grid = await loadFullGrid(record);
        if (!alive) return;
        if (!grid) {
          setState("missing");
          return;
        }
        setArtwork({ ...record, target_grid: grid });
        setState("ready");
      } catch {
        if (alive) setState("missing");
      }
    })();

    return () => {
      alive = false;
    };
  }, [artworkId]);

  if (state === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="h-4 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="aspect-square w-full animate-pulse rounded-[1.5rem] bg-secondary/70" />
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-secondary/70" />
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-secondary/70" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "missing" || !artwork) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-2xl tracking-tight">This canvas isn&apos;t here</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been removed, or the link belongs to a map that no longer exists.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the gallery
        </Link>
      </div>
    );
  }

  return <StudioSession key={artwork.id} artwork={artwork} />;
}