// The collection: 17 hand-painted masterpieces plus 983 real paintings from the
// public-domain collections of the world's museums. Each museum work carries the
// address of its image; its numbered grid is built from that image when the work
// is opened, so a thousand canvases cost nothing to store.
import { FEATURED_ARTWORKS } from "@/data/featuredArtworks";
import MUSEUM from "./museum.json";

const IMAGE_ROOT = "https://thumb.wikimedia.org/wikipedia/commons/thumb";

// Sizes spread across the ladder: mostly postcards and studies, with a few
// grand canvases for a long evening.
const SIZE_LADDER = [24, 24, 24, 24, 32, 32, 32, 32, 40, 40, 48, 48, 48, 56, 64, 64, 80, 96, 128];

function hashOf(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export const sizeFor = (slug) => SIZE_LADDER[hashOf(slug) % SIZE_LADDER.length];

export const difficultyForSize = (size) => (size <= 32 ? "easy" : size <= 48 ? "medium" : "hard");

export const MASTERPIECES = FEATURED_ARTWORKS.map((art) => ({ ...art, series: "masterpiece" }));

export const MUSEUM_WORKS = MUSEUM.map((row) => {
  const size = sizeFor(row.s);
  return {
    slug: row.s,
    id: row.s,
    title: row.t,
    artist: row.a,
    year: "",
    description: "A colour-by-number study after the original, which is in the public domain.",
    img: IMAGE_ROOT + row.p,
    grid_size: size,
    difficulty: difficultyForSize(size),
    source: "featured",
    series: "museum",
  };
});

export const CATALOG = [...MASTERPIECES, ...MUSEUM_WORKS];

const bySlug = new Map(CATALOG.map((art) => [art.slug, art]));

/** A work from the collection — a masterpiece grid, or a museum painting. */
export function findWork(slug) {
  return bySlug.get(slug) || null;
}

export const tierOf = (size) => (size <= 32 ? "small" : size <= 48 ? "medium" : size <= 96 ? "large" : "grand");

export const TIERS = [
  { key: "all", label: "All works" },
  { key: "masterpieces", label: "Masterpieces" },
  { key: "completed", label: "Completed" },
  { key: "small", label: "Small · 24–32" },
  { key: "medium", label: "Medium · 40–48" },
  { key: "large", label: "Large · 56–96" },
  { key: "grand", label: "Grand · 128" },
];