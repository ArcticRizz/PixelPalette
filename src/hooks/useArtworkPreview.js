import { useEffect, useRef, useState } from "react";
import { previewOf } from "@/lib/gridCodec";
import { paintingPreview } from "@/lib/museumPaintings";

/**
 * The cover grid of an artwork: stored grids are used as they are, while museum
 * paintings build theirs from the painting's image once the card is on screen.
 */
export default function useArtworkPreview(artwork) {
  const stored = previewOf(artwork);
  const [preview, setPreview] = useState(() =>
    stored ? { grid: stored, palette: artwork?.palette } : null
  );
  const ref = useRef(null);
  const slug = artwork?.slug;
  const img = artwork?.img;

  useEffect(() => {
    if (stored || !img) return undefined;
    let alive = true;
    const load = () => {
      paintingPreview(artwork)
        .then((result) => {
          if (alive) setPreview(result);
        })
        .catch(() => {});
    };

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      load();
      return () => {
        alive = false;
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);

    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [stored, img, slug]);

  return { ref, grid: preview?.grid, palette: preview?.palette };
}