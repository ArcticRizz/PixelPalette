import { encodeGrid, gridOf, previewGrid } from "./gridCodec.js";

// Every grid, including 256 x 256 canvases, stays in the local database.
export async function storeGrid(grid) {
  return { target_grid: previewGrid(grid), target_compact: encodeGrid(grid) };
}

export async function loadFullGrid(artwork) {
  return gridOf(artwork);
}
