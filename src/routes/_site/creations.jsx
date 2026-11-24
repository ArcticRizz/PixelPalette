import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, PencilRuler, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ArtworkCard from "@/components/gallery/ArtworkCard";
import { getMyCreationIds, loadProgressIndex } from "@/lib/progressStore";

export const Route = createFileRoute("/_site/creations")({
  ssr: false,
  head: () => ({
    meta: [{ title: "My creations — Pixel & Pigment" }],
  }),
  component: CreationsPage,
});

const SOURCE_LABEL = {
  custom_image: "From image",
  custom_drawn: "Drawn",
};

function CreationsPage() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [items, setItems] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (isLoadingAuth) return undefined;
    let alive = true;
    setProgress(loadProgressIndex());

    const load = async () => {
      const collected = [];
      const seen = new Set();

      if (isAuthenticated && user?.id) {
        try {
          const res = await base44.entities.Artwork.filter(
            { created_by_id: user.id },
            { sort: "-created_date", limit: 60 }
          );
          const list = res?.items ?? res ?? [];
          list.forEach((item) => {
            if (item?.id && !seen.has(item.id)) {
              seen.add(item.id);
              collected.push(item);
            }
          });
        } catch {
          /* fall through to locally remembered maps */
        }
      }

      const localIds = getMyCreationIds().filter((id) => !seen.has(id));
      if (localIds.length) {
        const fetched = await Promise.all(
          localIds.slice(0, 40).map((id) => base44.entities.Artwork.get(id).catch(() => null))
        );
        fetched.forEach((item) => {
          if (item?.id && !seen.has(item.id)) {
            seen.add(item.id);
            collected.push(item);
          }
        });
      }

      if (alive) setItems(collected);
    };

    load();
    return () => {
      alive = false;
    };
  }, [isAuthenticated, isLoadingAuth, user?.id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Your studio</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">My creations</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Maps you have made from photos or drawn by hand, with your progress kept right where you left it.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <ImagePlus className="h-4 w-4" />
            From image
          </Link>
          <Link
            to="/designer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
          >
            <PencilRuler className="h-4 w-4" />
            Draw one
          </Link>
        </div>
      </header>

      {!isLoadingAuth && !isAuthenticated && (
        <p className="mt-5 rounded-full border border-border/70 bg-white/60 px-4 py-2.5 text-xs text-muted-foreground">
          You are browsing as a guest — your maps stay saved on this device. Sign in to keep them everywhere.
        </p>
      )}

      {items === null ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div key={key} className="rounded-[1.5rem] border border-border/70 bg-card p-2.5">
              <div className="aspect-square animate-pulse rounded-[1.15rem] bg-secondary/70" />
              <div className="px-1.5 py-3">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-[1.75rem] border border-dashed border-border bg-white/60 px-6 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <h2 className="mt-4 font-display text-xl tracking-tight">Nothing here yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Make your first map — a photo turned into squares, or a tiny drawing of your own.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              to="/create"
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              From an image
            </Link>
            <Link
              to="/designer"
              className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
            >
              Draw from scratch
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              percent={progress[artwork.id] || 0}
              badge={SOURCE_LABEL[artwork.source] || "Custom"}
            />
          ))}
        </div>
      )}
    </div>
  );
}