const KEY = "pixel-pigment.v1.progress";
const MINE = "pixel-pigment.v1.creations";

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

function readAll() {
  if (!canStore()) return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** { [artworkId]: percent } for gallery cards. */
export function loadProgressIndex() {
  const all = readAll();
  const out = {};
  Object.keys(all).forEach((id) => {
    out[id] = Number(all[id]?.p) || 0;
  });
  return out;
}

export function loadProgress(id) {
  const all = readAll();
  const entry = all[id];
  if (Array.isArray(entry?.g)) return entry.g;
  // big canvases are stored sparsely: [index, colour, index, colour, …]
  if (Array.isArray(entry?.s)) {
    const grid = new Array(Number(entry.n) || 0).fill(0);
    for (let i = 0; i < entry.s.length; i += 2) grid[entry.s[i]] = entry.s[i + 1];
    return grid;
  }
  return null;
}

export function saveProgress(id, grid, percent) {
  if (!canStore() || !id) return;
  try {
    const all = readAll();
    const stamp = { p: Math.round(percent), t: Date.now() };
    if (Array.isArray(grid) && grid.length > 4096) {
      const sparse = [];
      for (let i = 0; i < grid.length; i++) if (grid[i]) sparse.push(i, grid[i]);
      all[id] = { ...stamp, s: sparse, n: grid.length };
    } else {
      all[id] = { ...stamp, g: grid };
    }
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked — painting still works in memory */
  }
}

export function getMyCreationIds() {
  if (!canStore()) return [];
  try {
    const raw = window.localStorage.getItem(MINE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function rememberCreation(id) {
  if (!canStore() || !id) return;
  try {
    const ids = getMyCreationIds();
    if (!ids.includes(id)) {
      ids.unshift(id);
      window.localStorage.setItem(MINE, JSON.stringify(ids.slice(0, 120)));
    }
  } catch {
    /* ignore */
  }
}