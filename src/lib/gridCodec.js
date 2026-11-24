// Big maps cannot live in a database record as a 2D array of numbers: a 256x256
// grid is over 800 KB and records are capped at 100 KB, with a per-field cap too.
// Maps up to 128 squares are stored as one base-36 character per square; larger
// maps keep a small inline preview and their full grid in a private file.

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const VALUES = new Map([...ALPHABET].map((char, index) => [char, index]));

/** Above this size a map is stored compactly rather than as a 2D array. */
export const COMPACT_ABOVE = 64;

/** Above this size the full grid moves to a private file. */
export const FILE_ABOVE = 128;

/** The most colours a compact map can hold (base-36 digits). */
export const MAX_COLORS = 35;

export function encodeGrid(grid) {
  const out = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y] || [];
    for (let x = 0; x < row.length; x++) {
      const value = Number(row[x]) || 0;
      out.push(ALPHABET[Math.min(MAX_COLORS, Math.max(0, value))]);
    }
  }
  return out.join("");
}

export function decodeGrid(compact, size) {
  if (typeof compact !== "string" || !size) return null;
  const grid = [];
  let i = 0;
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push(VALUES.get(compact[i]) || 0);
      i += 1;
    }
    grid.push(row);
  }
  return grid;
}

/** A small copy of a grid, used for gallery covers of maps stored elsewhere. */
export function previewGrid(grid, target = 48) {
  const n = grid?.length || 0;
  if (!n) return [];
  if (n <= target) return grid;
  const out = [];
  for (let y = 0; y < target; y++) {
    const row = [];
    const sy = Math.floor((y * n) / target);
    for (let x = 0; x < target; x++) row.push(grid[sy][Math.floor((x * n) / target)]);
    out.push(row);
  }
  return out;
}

/** The full 2D grid of a stored artwork, wherever it was saved. */
export function gridOf(artwork) {
  if (!artwork) return null;
  if (typeof artwork.target_compact === "string" && artwork.target_compact.length) {
    return decodeGrid(artwork.target_compact, artwork.grid_size);
  }
  if (Array.isArray(artwork.target_grid) && artwork.target_grid.length) return artwork.target_grid;
  return null;
}

/** A grid small enough to draw on a gallery card. */
export function previewOf(artwork) {
  if (Array.isArray(artwork?.target_grid) && artwork.target_grid.length) return artwork.target_grid;
  return gridOf(artwork);
}