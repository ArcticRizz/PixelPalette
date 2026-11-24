import { imageToGrid } from "@/lib/quantize";

// Real paintings arrive as photographs, so their numbered grids are built from
// the image itself. Images and results are cached for the session.
const imageCache = new Map();
const previewCache = new Map();
const gridCache = new Map();

function loadImage(url) {
  const cached = imageCache.get(url);
  if (cached) return cached;
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Painting image unavailable"));
    image.src = url;
  });
  imageCache.set(url, promise);
  return promise;
}

const colorsFor = (size) => (size <= 32 ? 10 : size <= 48 ? 14 : size <= 64 ? 16 : 20);

/** A 24-square cover of a museum painting, for the gallery. */
export async function paintingPreview(entry) {
  const cached = previewCache.get(entry.slug);
  if (cached) return cached;
  const image = await loadImage(entry.img);
  const result = imageToGrid(image, 24, 10);
  previewCache.set(entry.slug, result);
  return result;
}

/** The playable puzzle of a museum painting, at the size the work was given. */
export async function buildPainting(entry) {
  const cached = gridCache.get(entry.slug);
  if (cached) return cached;
  const image = await loadImage(entry.img);
  const result = imageToGrid(image, entry.grid_size, colorsFor(entry.grid_size));
  const full = { ...entry, ...result };
  gridCache.set(entry.slug, full);
  return full;
}