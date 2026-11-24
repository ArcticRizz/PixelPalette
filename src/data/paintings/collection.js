// A second wave of canvases, several of them much bigger than the classics.
// Shapes are normalised (0..1), so each painting keeps its composition at any
// grid size. Ready to seed straight into the Artwork entity.
import { toPuzzle } from "./render";

const build = (meta, size, ops) => ({ ...meta, grid_size: size, ...toPuzzle(size, ops) });

/* ------------------------------------------------------------------ Mondrian */
const mondrian = build(
  {
    slug: "composition-red-blue-yellow",
    title: "Composition with Red, Blue and Yellow",
    artist: "Piet Mondrian",
    year: "1930",
    description: "Black rules, white space and three pure blocks of colour — order you can rest your eyes on.",
  },
  48,
  [
    ["rect", 0, 0, 1, 1, "#F4F0E4"],
    ["rect", 0.05, 0.31, 0.32, 0.34, "#C0392B"],
    ["rect", 0.71, 0.65, 0.24, 0.3, "#1F4E79"],
    ["rect", 0.37, 0.05, 0.34, 0.26, "#E8B62C"],
    ["rect", 0.03, 0.03, 0.028, 0.94, "#17130F"],
    ["rect", 0.36, 0.03, 0.028, 0.94, "#17130F"],
    ["rect", 0.7, 0.03, 0.028, 0.94, "#17130F"],
    ["rect", 0.94, 0.03, 0.028, 0.94, "#17130F"],
    ["rect", 0.03, 0.03, 0.94, 0.028, "#17130F"],
    ["rect", 0.03, 0.3, 0.94, 0.028, "#17130F"],
    ["rect", 0.03, 0.64, 0.94, 0.028, "#17130F"],
    ["rect", 0.03, 0.94, 0.94, 0.028, "#17130F"],
  ]
);

/* ---------------------------------------------------------------- Kandinsky */
const KANDINSKY_COLORS = [
  "#E8B62C", "#C0392B", "#1F4E79", "#6E7A3A", "#E07A3A", "#6B4A7A",
  "#2F6F9E", "#D9C7A8", "#8A3A2A", "#F2EDE3", "#1B2A3A",
];

const kandinskyOps = [["rect", 0, 0, 1, 1, "#F2EDE3"]];
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 4; col++) {
    const k = row * 4 + col;
    const cx = (col + 0.5) / 4;
    const cy = (row + 0.5) / 4;
    kandinskyOps.push(["rect", col / 4, row / 4, 0.25, 0.25, KANDINSKY_COLORS[(k + 2) % 11]]);
    kandinskyOps.push(["ellipse", cx, cy, 0.112, 0.112, KANDINSKY_COLORS[k % 11]]);
    kandinskyOps.push(["ellipse", cx, cy, 0.076, 0.076, KANDINSKY_COLORS[(k + 4) % 11]]);
    kandinskyOps.push(["ellipse", cx, cy, 0.04, 0.04, KANDINSKY_COLORS[(k + 8) % 11]]);
  }
}

const kandinsky = build(
  {
    slug: "squares-with-concentric-circles",
    title: "Squares with Concentric Circles",
    artist: "Wassily Kandinsky",
    year: "c. 1913",
    description: "A quilt of colour studies — every square holds three rings of a different hue.",
  },
  40,
  kandinskyOps
);

/* ---------------------------------------------------------------- Sunflowers */
const SUNFLOWERS = [
  [0.3, 0.26], [0.5, 0.16], [0.7, 0.24], [0.2, 0.44], [0.4, 0.38],
  [0.62, 0.4], [0.8, 0.42], [0.32, 0.6], [0.52, 0.54], [0.72, 0.58],
];

const sunflowerOps = [
  ["rect", 0, 0, 1, 1, "#C9A94E"],
  ["rect", 0, 0.8, 1, 0.2, "#8E6B33"],
  ["rect", 0, 0.8, 1, 0.025, "#6B4A1E"],
];
SUNFLOWERS.forEach(([x, y]) => sunflowerOps.push(["line", 0.5, 0.66, x, y, "#6E7A3A", 0.016]));
sunflowerOps.push(["ellipse", 0.4, 0.62, 0.075, 0.032, "#4E6B2A"]);
sunflowerOps.push(["ellipse", 0.61, 0.58, 0.065, 0.03, "#4E6B2A"]);
sunflowerOps.push(["ellipse", 0.45, 0.72, 0.085, 0.03, "#4E6B2A"]);
SUNFLOWERS.forEach(([x, y], i) => {
  const outer = i % 3 === 0 ? "#E8B23A" : i % 3 === 1 ? "#F2D06B" : "#D97A2B";
  sunflowerOps.push(["ellipse", x, y, 0.085, 0.085, outer]);
  sunflowerOps.push(["ellipse", x, y, 0.055, 0.055, i % 3 === 2 ? "#E8B23A" : "#D97A2B"]);
  sunflowerOps.push(["ellipse", x, y, 0.026, 0.026, "#6B4A1E"]);
});
sunflowerOps.push(["poly", [[0.38, 0.64], [0.62, 0.64], [0.58, 0.88], [0.42, 0.88]], "#7A5A2A"]);
sunflowerOps.push(["rect", 0.44, 0.68, 0.045, 0.16, "#8E6B33"]);

const sunflowers = build(
  {
    slug: "sunflowers",
    title: "Sunflowers",
    artist: "Vincent van Gogh",
    year: "1888",
    description: "A crowded vase of gold and amber, painted while waiting for a friend to arrive.",
  },
  40,
  sunflowerOps
);

/* ------------------------------------------------------------------ The Kiss */
const kissPattern = [
  [0.24, 0.62], [0.3, 0.72], [0.38, 0.66], [0.44, 0.78], [0.52, 0.64],
  [0.58, 0.74], [0.66, 0.68], [0.72, 0.8], [0.34, 0.84], [0.62, 0.86],
];
const kissOps = [
  ["rect", 0, 0, 1, 1, "#C9A227"],
  ["rect", 0, 0.86, 1, 0.14, "#6E7A3A"],
  ["ellipse", 0.5, 0.66, 0.4, 0.3, "#D4AF37"],
  ["rect", 0.12, 0.66, 0.76, 0.24, "#D4AF37"],
  ["rect", 0.14, 0.58, 0.72, 0.1, "#D4AF37"],
  ["ellipse", 0.63, 0.2, 0.12, 0.09, "#3A2A1A"],
  ["rect", 0.68, 0.2, 0.11, 0.34, "#3A2A1A"],
  ["ellipse", 0.37, 0.22, 0.1, 0.07, "#8A5A2A"],
  ["ellipse", 0.4, 0.33, 0.085, 0.105, "#E8C39E"],
  ["ellipse", 0.62, 0.31, 0.09, 0.11, "#E8C39E"],
  ["ellipse", 0.5, 0.52, 0.075, 0.035, "#E8C39E"],
];
kissPattern.forEach(([x, y]) => kissOps.push(["rect", x, y, 0.05, 0.05, "#8A6A2A"]));

const kiss = build(
  {
    slug: "the-kiss",
    title: "The Kiss",
    artist: "Gustav Klimt",
    year: "1908",
    description: "Two figures wrapped in a single golden robe, all pattern and warmth.",
  },
  40,
  kissOps
);

/* -------------------------------------------------------------- Water Lilies */
const pads = [
  [0.22, 0.52], [0.46, 0.34], [0.68, 0.56], [0.34, 0.72],
  [0.76, 0.68], [0.58, 0.8], [0.14, 0.3], [0.86, 0.44],
];
const blooms = [[0.3, 0.5], [0.6, 0.4], [0.74, 0.62], [0.4, 0.76], [0.2, 0.66]];

const lilyOps = [
  ["rect", 0, 0, 1, 1, "#3E5A6B"],
  ["ellipse", 0.3, 0.3, 0.38, 0.24, "#55799B"],
  ["ellipse", 0.74, 0.24, 0.3, 0.2, "#6E8AA0"],
  ["ellipse", 0.5, 0.12, 0.34, 0.14, "#7FA0B8"],
  ["ellipse", 0.52, 0.62, 0.44, 0.26, "#4E7A50"],
  ["ellipse", 0.2, 0.82, 0.3, 0.18, "#5E8A86"],
  ["ellipse", 0.84, 0.78, 0.26, 0.2, "#86A86A"],
  ["line", 0.08, 0.42, 0.42, 0.39, "#A9C4D9", 0.012],
  ["line", 0.55, 0.48, 0.92, 0.46, "#A9C4D9", 0.01],
];
pads.forEach(([x, y]) => lilyOps.push(["ellipse", x, y, 0.065, 0.038, "#4E7A50"]));
pads.forEach(([x, y]) => lilyOps.push(["ellipse", x - 0.012, y - 0.008, 0.038, 0.022, "#86A86A"]));
blooms.forEach(([x, y]) => {
  lilyOps.push(["ellipse", x, y, 0.03, 0.026, "#E3A0B4"]);
  lilyOps.push(["ellipse", x, y, 0.013, 0.012, "#F2EDE3"]);
});

const waterLilies = build(
  {
    slug: "water-lilies",
    title: "Water Lilies",
    artist: "Claude Monet",
    year: "1906",
    description: "A pond at dusk — floating pads, pale blossoms and the sky caught in the water.",
  },
  40,
  lilyOps
);

/* ------------------------------------------------------ Persistence of Memory */
const persistence = build(
  {
    slug: "the-persistence-of-memory",
    title: "The Persistence of Memory",
    artist: "Salvador Dalí",
    year: "1931",
    description: "Three soft watches drooping over a quiet, sunlit shore.",
  },
  32,
  [
    ["rect", 0, 0, 1, 1, "#C9A96E"],
    ["rect", 0, 0, 1, 0.46, "#A9C4D9"],
    ["rect", 0, 0.46, 1, 0.1, "#3E6B8A"],
    ["poly", [[0.6, 0.56], [0.74, 0.3], [1, 0.26], [1, 0.56]], "#8A7A5A"],
    ["poly", [[0.6, 0.56], [0.74, 0.3], [0.8, 0.33], [0.68, 0.56]], "#6B5A42"],
    ["rect", 0, 0.56, 1, 0.44, "#C9A96E"],
    ["rect", 0, 0.56, 1, 0.025, "#A8894F"],
    ["rect", 0.1, 0.58, 0.26, 0.06, "#6B5A3A"],
    ["rect", 0.12, 0.64, 0.22, 0.16, "#4A3A22"],
    ["line", 0.42, 0.58, 0.58, 0.26, "#4A3A22", 0.018],
    ["line", 0.5, 0.42, 0.6, 0.38, "#4A3A22", 0.014],
    ["ellipse", 0.28, 0.5, 0.14, 0.07, "#6B5A3A"],
    ["ellipse", 0.28, 0.5, 0.115, 0.05, "#E8D48A"],
    ["poly", [[0.31, 0.52], [0.34, 0.72], [0.24, 0.72]], "#6B5A3A"],
    ["poly", [[0.305, 0.53], [0.33, 0.7], [0.255, 0.7]], "#E8D48A"],
    ["ellipse", 0.58, 0.27, 0.11, 0.06, "#6B5A3A"],
    ["ellipse", 0.58, 0.27, 0.09, 0.042, "#E8D48A"],
    ["ellipse", 0.78, 0.74, 0.12, 0.06, "#6B5A3A"],
    ["ellipse", 0.78, 0.74, 0.1, 0.045, "#E8D48A"],
    ["line", 0.26, 0.5, 0.3, 0.47, "#4A3A22", 0.01],
    ["line", 0.56, 0.27, 0.59, 0.25, "#4A3A22", 0.01],
    ["line", 0.76, 0.74, 0.8, 0.72, "#4A3A22", 0.01],
  ]
);

/* ------------------------------------------------------------- The Son of Man */
const sonOfMan = build(
  {
    slug: "the-son-of-man",
    title: "The Son of Man",
    artist: "René Magritte",
    year: "1964",
    description: "A bowler hat, a black coat and one green apple hiding a face.",
  },
  32,
  [
    ["rect", 0, 0, 1, 1, "#8A9A86"],
    ["rect", 0, 0, 1, 0.42, "#B9C6C2"],
    ["ellipse", 0.22, 0.12, 0.2, 0.07, "#D9E0DC"],
    ["ellipse", 0.78, 0.18, 0.24, 0.08, "#D9E0DC"],
    ["rect", 0, 0.4, 1, 0.025, "#7A8A76"],
    ["poly", [[0.26, 1], [0.33, 0.53], [0.67, 0.53], [0.74, 1]], "#1B1B1F"],
    ["poly", [[0.4, 0.53], [0.5, 0.64], [0.6, 0.53]], "#F2EDE3"],
    ["rect", 0.36, 0.53, 0.06, 0.12, "#1B1B1F"],
    ["ellipse", 0.5, 0.4, 0.11, 0.125, "#E8C39E"],
    ["ellipse", 0.5, 0.285, 0.155, 0.032, "#17130F"],
    ["ellipse", 0.5, 0.235, 0.095, 0.065, "#17130F"],
    ["ellipse", 0.5, 0.455, 0.095, 0.085, "#C0392B"],
    ["ellipse", 0.475, 0.44, 0.03, 0.025, "#D9503A"],
    ["line", 0.5, 0.375, 0.51, 0.34, "#4A3A22", 0.012],
    ["ellipse", 0.55, 0.355, 0.038, 0.018, "#4E7A50"],
  ]
);

/* -------------------------------------------------------------- Soup Can */
const soupCan = build(
  {
    slug: "campbells-soup-can",
    title: "Campbell's Soup Can",
    artist: "Andy Warhol",
    year: "1962",
    description: "The red-and-gold label that turned a grocery shelf into art.",
  },
  32,
  [
    ["rect", 0, 0, 1, 1, "#F2EDE3"],
    ["rect", 0.22, 0.12, 0.56, 0.76, "#F7F3E9"],
    ["rect", 0.22, 0.1, 0.56, 0.06, "#C9C4B8"],
    ["rect", 0.22, 0.16, 0.56, 0.09, "#C0392B"],
    ["rect", 0.22, 0.76, 0.56, 0.1, "#C0392B"],
    ["rect", 0.22, 0.86, 0.56, 0.04, "#C9C4B8"],
    ["ellipse", 0.5, 0.44, 0.16, 0.16, "#D4AF37"],
    ["ellipse", 0.5, 0.44, 0.125, 0.125, "#F7F3E9"],
    ["line", 0.42, 0.4, 0.58, 0.38, "#C0392B", 0.02],
    ["line", 0.43, 0.45, 0.57, 0.44, "#C0392B", 0.02],
    ["line", 0.44, 0.5, 0.56, 0.49, "#C0392B", 0.016],
    ["rect", 0.34, 0.66, 0.32, 0.02, "#2A1A14"],
    ["rect", 0.36, 0.7, 0.28, 0.015, "#2A1A14"],
    ["ellipse", 0.5, 0.93, 0.32, 0.035, "#D9D3C6"],
  ]
);

/* ---------------------------------------------------------------- Nighthawks */
const nighthawks = build(
  {
    slug: "nighthawks",
    title: "Nighthawks",
    artist: "Edward Hopper",
    year: "1942",
    description: "Four figures in a lit diner, and a city that has gone to sleep.",
  },
  40,
  [
    ["rect", 0, 0, 1, 1, "#1B2733"],
    ["rect", 0, 0.78, 1, 0.22, "#22303A"],
    ["rect", 0.3, 0.16, 0.68, 0.62, "#7A3A2A"],
    ["rect", 0.3, 0.16, 0.68, 0.04, "#5A2A1E"],
    ["rect", 0.36, 0.26, 0.56, 0.4, "#C9CE9A"],
    ["rect", 0.36, 0.26, 0.56, 0.03, "#8A8A5A"],
    ["rect", 0.36, 0.5, 0.56, 0.03, "#8A8A5A"],
    ["rect", 0.3, 0.26, 0.05, 0.52, "#D9A24A"],
    ["ellipse", 0.5, 0.42, 0.045, 0.055, "#2A2A2A"],
    ["rect", 0.47, 0.46, 0.07, 0.14, "#2A2A2A"],
    ["ellipse", 0.62, 0.42, 0.045, 0.055, "#2A2A2A"],
    ["rect", 0.59, 0.46, 0.07, 0.14, "#2A2A2A"],
    ["ellipse", 0.74, 0.4, 0.04, 0.05, "#2A2A2A"],
    ["rect", 0.715, 0.44, 0.05, 0.16, "#2A2A2A"],
    ["ellipse", 0.84, 0.36, 0.035, 0.045, "#3A3A3A"],
    ["rect", 0.82, 0.4, 0.04, 0.2, "#3A3A3A"],
    ["rect", 0.3, 0.66, 0.68, 0.02, "#5A2A1E"],
  ]
);

/* ----------------------------------------------------------- Café Terrace */
const cafeOps = [
  ["rect", 0, 0, 1, 1, "#22355E"],
  ["dots", [[0.1, 0.08], [0.22, 0.14], [0.86, 0.1], [0.7, 0.06], [0.44, 0.05]], "#F2D06B", 0.014],
  ["rect", 0, 0.3, 0.18, 0.7, "#2A3A5A"],
  ["rect", 0.86, 0.26, 0.14, 0.74, "#2A3A5A"],
  ["rect", 0.06, 0.4, 0.88, 0.32, "#C97A3A"],
  ["rect", 0.1, 0.42, 0.8, 0.26, "#E0A34A"],
  ["poly", [[0.1, 0.26], [0.9, 0.26], [0.96, 0.4], [0.04, 0.4]], "#E8B23A"],
  ["rect", 0, 0.72, 1, 0.28, "#6B5A3A"],
];
[0.22, 0.34, 0.46, 0.58, 0.7, 0.82].forEach((x) => cafeOps.push(["rect", x, 0.27, 0.022, 0.12, "#C97A3A"]));
[
  [0.24, 0.78], [0.52, 0.8], [0.78, 0.78],
].forEach(([x, y]) => {
  cafeOps.push(["ellipse", x, y, 0.08, 0.03, "#3A2A1A"]);
  cafeOps.push(["rect", x - 0.02, y + 0.02, 0.04, 0.1, "#3A2A1A"]);
});
[
  [0.34, 0.62], [0.66, 0.6],
].forEach(([x, y]) => {
  cafeOps.push(["ellipse", x, y, 0.035, 0.04, "#3A2A1A"]);
  cafeOps.push(["rect", x - 0.03, y + 0.04, 0.06, 0.12, "#3A2A1A"]);
});

const cafeTerrace = build(
  {
    slug: "cafe-terrace-at-night",
    title: "Café Terrace at Night",
    artist: "Vincent van Gogh",
    year: "1888",
    description: "A yellow awning, warm lamplight and a street of deep blue night.",
  },
  40,
  cafeOps
);

/* -------------------------------------------------------------- The Bedroom */
const bedroomOps = [
  ["rect", 0, 0, 1, 1, "#8FA6A4"],
  ["rect", 0, 0.7, 1, 0.3, "#A8722A"],
  ["rect", 0, 0.7, 1, 0.02, "#8A5A22"],
  ["rect", 0.06, 0.16, 0.22, 0.3, "#5E8A86"],
  ["rect", 0.06, 0.16, 0.22, 0.02, "#3E5B5B"],
  ["rect", 0.16, 0.16, 0.02, 0.3, "#3E5B5B"],
  ["rect", 0.38, 0.14, 0.1, 0.12, "#C9A227"],
  ["rect", 0.52, 0.18, 0.08, 0.1, "#6E7A3A"],
  ["rect", 0.56, 0.38, 0.4, 0.34, "#C9A227"],
  ["rect", 0.58, 0.44, 0.36, 0.22, "#C0392B"],
  ["rect", 0.58, 0.4, 0.36, 0.06, "#F2EDE3"],
  ["rect", 0.1, 0.6, 0.1, 0.03, "#C9A227"],
  ["rect", 0.12, 0.63, 0.02, 0.1, "#8A6A2A"],
  ["rect", 0.18, 0.63, 0.02, 0.1, "#8A6A2A"],
  ["rect", 0.28, 0.62, 0.16, 0.03, "#8A5A22"],
  ["rect", 0.3, 0.65, 0.02, 0.1, "#8A5A22"],
  ["rect", 0.4, 0.65, 0.02, 0.1, "#8A5A22"],
];
for (let i = 1; i < 10; i++) {
  bedroomOps.push(["line", i / 10, 0.72, i / 10 - 0.06, 1, "#8A5A22", 0.008]);
}

const bedroom = build(
  {
    slug: "the-bedroom",
    title: "The Bedroom",
    artist: "Vincent van Gogh",
    year: "1888",
    description: "A blue room, a wooden floor and a bed with a red cover.",
  },
  32,
  bedroomOps
);

/* -------------------------------------------------- Wheat Field with Cypresses */
const wheatFlecks = [];
for (let y = 0.62; y < 1; y += 0.075) {
  for (let x = 0.04; x < 1; x += 0.075) wheatFlecks.push([x, y + (Math.round(x * 100) % 3) * 0.012]);
}

const wheatField = build(
  {
    slug: "wheat-field-with-cypresses",
    title: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    year: "1889",
    description: "A green flame of cypress against gold wheat and a windy sky.",
  },
  40,
  [
    ["rect", 0, 0, 1, 1, "#8FB4CE"],
    ["ellipse", 0.35, 0.14, 0.22, 0.06, "#A9C6DA"],
    ["ellipse", 0.62, 0.1, 0.26, 0.07, "#A9C6DA"],
    ["ellipse", 0.72, 0.22, 0.2, 0.06, "#F2EDE3"],
    ["ellipse", 0.4, 0.26, 0.24, 0.05, "#F2EDE3"],
    ["ellipse", 0.14, 0.2, 0.14, 0.05, "#F2EDE3"],
    ["ellipse", 0.88, 0.1, 0.06, 0.06, "#F2D06B"],
    ["rect", 0, 0.46, 1, 0.08, "#6E8A5A"],
    ["rect", 0, 0.54, 1, 0.06, "#4E7A50"],
    ["rect", 0, 0.58, 1, 0.42, "#D9B84A"],
    ["rect", 0, 0.58, 1, 0.05, "#C9A227"],
    ["rect", 0, 0.78, 1, 0.22, "#E8CE73"],
    ["dots", wheatFlecks, "#C9A227", 0.014],
    ["poly", [[0.12, 1], [0.16, 0.52], [0.21, 0.3], [0.26, 0.52], [0.3, 1]], "#2A4A2A"],
    ["poly", [[0.15, 1], [0.19, 0.56], [0.21, 0.4], [0.23, 0.56], [0.26, 1]], "#1B3320"],
  ]
);

export const EXTRA_ARTWORKS = [
  mondrian,
  kandinsky,
  sunflowers,
  kiss,
  waterLilies,
  persistence,
  sonOfMan,
  soupCan,
  nighthawks,
  cafeTerrace,
  bedroom,
  wheatField,
];