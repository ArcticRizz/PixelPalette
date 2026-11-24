// The curated collection: five hand-painted 24x24 classics plus the larger
// canvases from the painter collection. Every cell holds a palette number
// (1..N), 0 = blank.
import { EXTRA_ARTWORKS } from "./paintings/collection";

const SIZE = 24;

const blank = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function rect(g, x0, y0, x1, y1, c) {
  for (let y = Math.max(0, y0); y <= Math.min(SIZE - 1, y1); y++) {
    for (let x = Math.max(0, x0); x <= Math.min(SIZE - 1, x1); x++) g[y][x] = c;
  }
}

function ellipse(g, cx, cy, rx, ry, c) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = (x + 0.5 - cx) / rx;
      const dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) g[y][x] = c;
    }
  }
}

function pointInPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function poly(g, pts, c) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (pointInPoly(x + 0.5, y + 0.5, pts)) g[y][x] = c;
    }
  }
}

const set = (g, x, y, c) => {
  if (y >= 0 && y < SIZE && x >= 0 && x < SIZE) g[y][x] = c;
};
const get = (g, x, y) => (y >= 0 && y < SIZE && x >= 0 && x < SIZE ? g[y][x] : 0);
const each = (g, fn) => {
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) fn(x, y, g[y][x]);
};

// Drops unused palette entries and renumbers the grid from 1, so every
// colour in a puzzle is actually needed.
function finalize(g, palette) {
  const order = new Map();
  each(g, (x, y, v) => {
    if (v > 0 && !order.has(v)) order.set(v, order.size + 1);
  });
  const grid = g.map((row) => row.map((v) => (v ? order.get(v) : 0)));
  const keys = [...order.keys()].sort((a, b) => order.get(a) - order.get(b));
  return { palette: keys.map((i) => palette[i - 1]), grid };
}

const STARRY = [
  "#131f3d", "#1b3260", "#274b8a", "#3f76b8", "#8dc0e0",
  "#f2c14e", "#f9ecc0", "#0f2f24", "#1c5240", "#2c4a37",
  "#e9dfc6", "#c98a3a", "#0a1220",
];

function starryNight() {
  const g = blank();
  rect(g, 0, 0, 23, 17, 1);
  each(g, (x, y) => {
    const w = Math.sin(x / 2.8 + y * 0.35);
    if (w > 0.5) set(g, x, y, 2);
    if (w > 0.88) set(g, x, y, 3);
  });
  for (let x = 0; x < SIZE; x++) {
    const y1 = Math.round(3 + 2.3 * Math.sin(x / 2.4 + 0.6));
    set(g, x, y1, 3);
    set(g, x, y1 + 1, 4);
    set(g, x, y1 + 2, 5);
    const y2 = Math.round(9 + 2 * Math.sin(x / 3.1 + 2.2));
    set(g, x, y2, 3);
    set(g, x, y2 + 1, 4);
  }
  ellipse(g, 20, 3.5, 3.2, 3.2, 6);
  ellipse(g, 20, 3.5, 2.2, 2.2, 7);
  [
    [3, 3], [9, 2], [15, 4], [21, 8], [6, 8],
    [12, 7], [17, 10], [2, 12], [10, 13], [19, 14],
  ].forEach(([x, y]) => {
    ellipse(g, x + 0.5, y + 0.5, 1.35, 1.35, 6);
    set(g, x, y, 7);
  });
  for (let x = 0; x < SIZE; x++) {
    const h = 16 + Math.round(1.8 * Math.sin(x / 4.2 + 0.8));
    for (let y = h; y < SIZE; y++) set(g, x, y, 10);
  }
  rect(g, 11, 18, 15, 22, 11);
  poly(g, [[10.5, 18], [13, 15.4], [15.6, 18]], 12);
  rect(g, 16, 17, 20, 22, 11);
  poly(g, [[15.4, 17], [18, 14.4], [20.6, 17]], 12);
  rect(g, 8, 17, 9, 22, 11);
  poly(g, [[7.4, 17], [8.5, 12.6], [9.6, 17]], 10);
  [[12, 20], [14, 21], [17, 19], [19, 21], [8, 19]].forEach(([x, y]) => set(g, x, y, 12));
  rect(g, 0, 22, 23, 23, 9);
  poly(g, [[4.6, 1.5], [0.5, 24], [9.5, 24]], 8);
  poly(g, [[4.6, 6], [2.4, 24], [7.4, 24]], 9);
  poly(g, [[4.6, 10], [3.4, 24], [5.8, 24]], 13);
  return g;
}

const MONA = [
  "#33342a", "#4a4a3a", "#6b6a52", "#241f19", "#8a6a4a",
  "#b08a63", "#cfa87d", "#e6c9a4", "#2b2620", "#463c2c", "#8a6a3a",
];

function monaLisa() {
  const g = blank();
  rect(g, 0, 0, 23, 23, 2);
  each(g, (x, y) => {
    if (x * 0.6 + y * 0.5 > 18 && (x + y) % 5 !== 0) set(g, x, y, 3);
  });
  each(g, (x, y) => {
    if (x < 5 && y % 6 !== 0) set(g, x, y, 1);
  });
  ellipse(g, 12, 11, 7.2, 8.6, 4);
  ellipse(g, 11.5, 9.6, 4.4, 5.4, 6);
  ellipse(g, 10.5, 8.4, 3.2, 3.4, 7);
  each(g, (x, y, v) => {
    if (v === 6 && x > 13) set(g, x, y, 5);
  });
  each(g, (x, y, v) => {
    if (v === 7 && x > 12) set(g, x, y, 6);
  });
  ellipse(g, 10.5, 6.9, 1.9, 1.6, 8);
  set(g, 9, 9, 4);
  set(g, 10, 9, 4);
  set(g, 13, 9, 4);
  set(g, 14, 9, 4);
  set(g, 9, 10, 5);
  set(g, 14, 10, 5);
  set(g, 11, 11, 5);
  set(g, 12, 11, 5);
  set(g, 12, 12, 5);
  set(g, 10, 13, 5);
  set(g, 11, 13, 5);
  set(g, 12, 13, 5);
  set(g, 13, 13, 5);
  set(g, 11, 14, 5);
  rect(g, 10, 14, 13, 17, 6);
  rect(g, 12, 14, 13, 17, 5);
  poly(g, [[6, 12], [3.6, 18], [7, 21], [9.2, 16]], 4);
  poly(g, [[17, 12], [19.4, 18], [16, 21], [13.8, 16]], 4);
  poly(g, [[0, 18], [5, 16], [9, 17], [14, 17], [18, 16], [23, 18], [23, 23], [0, 23]], 9);
  poly(g, [[1.5, 20], [8, 19], [11, 24], [1.5, 24]], 10);
  poly(g, [[22.5, 20], [16, 19], [13, 24], [22.5, 24]], 10);
  each(g, (x, y, v) => {
    if (v === 9 && y === 18 && x > 2 && x < 21) set(g, x, y, 11);
  });
  ellipse(g, 11.5, 21.4, 4.4, 2.2, 6);
  ellipse(g, 11, 21, 3.4, 1.4, 7);
  each(g, (x, y, v) => {
    if (v === 6 && y > 21) set(g, x, y, 5);
  });
  return g;
}

const WAVE = [
  "#0d2b45", "#1c4b73", "#2f6f9e", "#6aa5c7",
  "#f6f1e4", "#9fb4bf", "#fbfbf5", "#8a6a45",
];

function greatWave() {
  const g = blank();
  rect(g, 0, 0, 23, 23, 5);
  poly(g, [[17.4, 20], [20.2, 13.4], [23.4, 20]], 6);
  poly(g, [[19.2, 16.4], [20.2, 13.4], [21.2, 16.4]], 7);
  rect(g, 0, 19, 23, 23, 2);
  poly(g, [[-1, 25], [-1, 9], [4, 5], [9, 4], [13, 6], [16, 10], [16.6, 14], [15.6, 19], [10, 21], [-1, 21]], 1);
  poly(g, [[-1, 21], [2, 11], [6, 7], [10, 6], [13, 8], [15, 12], [14.6, 16], [12.6, 19], [7, 20], [-1, 20]], 2);
  poly(g, [[-1, 19], [3, 12], [7, 9], [10, 8], [12, 10], [12.6, 13], [11.6, 16], [8.6, 19], [3, 19]], 3);
  poly(g, [[-1, 17], [4, 12], [8, 11], [10, 12], [10, 14], [8, 17], [3, 17]], 4);
  each(g, (x, y, v) => {
    if (v === 1 && (get(g, x - 1, y) === 5 || get(g, x, y - 1) === 5)) set(g, x, y, 7);
  });
  [[6, 6], [8, 7], [10, 8], [12, 9], [14, 11], [15, 13], [5, 10], [3, 13], [9, 5]].forEach(([x, y]) => {
    set(g, x, y, 7);
    set(g, x, y + 1, 4);
  });
  poly(g, [[8, 15], [13, 14], [14, 17], [9, 17]], 8);
  poly(g, [[12, 11], [16, 10], [17, 13], [13, 13]], 8);
  each(g, (x, y, v) => {
    if (v === 2 && y > 20 && (x + y) % 4 === 0) set(g, x, y, 7);
  });
  return g;
}

const PEARL = [
  "#101a1c", "#1d2c2e", "#2f4f6b", "#4d7fa6", "#7fb0cf",
  "#e8c9a6", "#c9a07a", "#e8c15a", "#b9902f", "#fbfaf5", "#3a2a22",
];

function pearlEarring() {
  const g = blank();
  rect(g, 0, 0, 23, 23, 1);
  each(g, (x, y) => {
    if (x > 14 && (x + y) % 7 !== 0) set(g, x, y, 2);
  });
  ellipse(g, 11, 7.5, 7, 6, 3);
  ellipse(g, 10, 6.5, 5.4, 4.4, 4);
  ellipse(g, 9.5, 5.5, 3.2, 2.6, 5);
  poly(g, [[15, 7], [20, 10], [19, 16], [14, 13]], 3);
  poly(g, [[16, 8], [19, 11], [18, 15], [15, 12]], 4);
  ellipse(g, 11, 12, 4.4, 5.2, 6);
  each(g, (x, y, v) => {
    if (v === 6 && x < 9) set(g, x, y, 7);
  });
  set(g, 9, 11, 1);
  set(g, 13, 11, 1);
  set(g, 11, 13, 7);
  set(g, 11, 15, 7);
  set(g, 12, 15, 7);
  ellipse(g, 15.6, 14, 1.8, 1.8, 10);
  poly(g, [[0, 17], [3, 14], [8, 15], [11, 23], [0, 23]], 8);
  poly(g, [[0, 21], [3, 18], [6, 19], [8, 23], [0, 23]], 9);
  poly(g, [[5, 19], [12, 17], [20, 19], [23, 23], [6, 23]], 11);
  return g;
}

const SCREAM = [
  "#c25a2b", "#e8894a", "#f2c15c", "#a83b2b", "#2b3a4a",
  "#4a6b80", "#1b1a1f", "#3a3226", "#c9b48a", "#efe6d6",
  "#7a6a52", "#6b8f7a",
];

function theScream() {
  const g = blank();
  each(g, (x, y) => {
    if (y > 16) return;
    const v = Math.sin((x * 0.8 + y * 2.4) / 3.4) + Math.cos((y - x * 0.6) / 2.6);
    set(g, x, y, v > 0.7 ? 2 : v > 0 ? 3 : v > -0.6 ? 1 : 4);
  });
  each(g, (x, y) => {
    if (y >= 17) set(g, x, y, (x + y) % 7 === 0 ? 6 : 5);
  });
  poly(g, [[0, 25], [0, 19], [25, 13], [25, 17.5]], 8);
  each(g, (x, y, v) => {
    if (v === 8 && y >= 18 && y <= 19) set(g, x, y, 11);
  });
  rect(g, 17, 13, 18, 17, 6);
  rect(g, 20, 12, 21, 16, 6);
  poly(g, [[5.6, 24], [7.8, 15], [13.2, 15], [15.4, 24]], 6);
  ellipse(g, 10.5, 11, 3.2, 3.6, 10);
  rect(g, 6, 10, 7, 13, 6);
  rect(g, 14, 10, 15, 13, 6);
  set(g, 9, 10, 6);
  set(g, 12, 10, 6);
  ellipse(g, 10.5, 12.6, 1.1, 1.4, 6);
  return g;
}

export const difficultyFor = (size, colors) => {
  if (size >= 64 || colors >= 13) return "hard";
  if (size >= 40 && colors >= 10) return "hard";
  if (size >= 32) return "medium";
  return colors >= 10 ? "medium" : "easy";
};

const RAW = [
  {
    slug: "starry-night",
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    year: "1889",
    description: "A swirling night sky over a sleeping village — twelve blues, two greens and a little gold.",
    ...finalize(starryNight(), STARRY),
  },
  {
    slug: "great-wave",
    title: "The Great Wave off Kanagawa",
    artist: "Katsushika Hokusai",
    year: "1831",
    description: "A curling wave, three boats and a quiet Mount Fuji in the distance.",
    ...finalize(greatWave(), WAVE),
  },
  {
    slug: "mona-lisa",
    title: "Mona Lisa",
    artist: "Leonardo da Vinci",
    year: "c. 1503",
    description: "Olive light, a folded smile and the most famous gaze in painting.",
    ...finalize(monaLisa(), MONA),
  },
  {
    slug: "girl-with-a-pearl-earring",
    title: "Girl with a Pearl Earring",
    artist: "Johannes Vermeer",
    year: "1665",
    description: "A blue turban, a yellow shawl and one small, glowing pearl.",
    ...finalize(pearlEarring(), PEARL),
  },
  {
    slug: "the-scream",
    title: "The Scream",
    artist: "Edvard Munch",
    year: "1893",
    description: "An orange sky over a dark fjord, and one figure holding their face.",
    ...finalize(theScream(), SCREAM),
  },
];

const classics = RAW.map((art, index) => {
  const { grid, ...rest } = art;
  return {
    ...rest,
    target_grid: grid,
    grid_size: SIZE,
    difficulty: difficultyFor(SIZE, art.palette.length),
    source: "featured",
    is_featured: true,
    sort_order: index + 1,
  };
});

const larger = EXTRA_ARTWORKS.map((art, index) => ({
  ...art,
  difficulty: difficultyFor(art.grid_size, art.palette.length),
  source: "featured",
  is_featured: true,
  sort_order: classics.length + index + 1,
}));

export const FEATURED_ARTWORKS = [...classics, ...larger];

export const findFeatured = (slug) => FEATURED_ARTWORKS.find((a) => a.slug === slug);