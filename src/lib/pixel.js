function toRgb(hex) {
  const clean = String(hex || "#ffffff").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
}

export function hexToRgba(hex, alpha = 1) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function readableOn(hex) {
  const [r, g, b] = toRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#3a3226" : "#ffffff";
}

export function flattenGrid(grid) {
  if (!Array.isArray(grid)) return [];
  const out = [];
  grid.forEach((row) => {
    (Array.isArray(row) ? row : []).forEach((v) => out.push(Number(v) || 0));
  });
  return out;
}

export function computeStats(flatTarget, flatProgress) {
  let required = 0;
  let correct = 0;
  let wrong = 0;
  for (let i = 0; i < flatTarget.length; i++) {
    const t = flatTarget[i];
    if (!t) continue;
    required++;
    const p = flatProgress[i] || 0;
    if (p === t) correct++;
    else if (p) wrong++;
  }
  const percent = required ? Math.round((correct / required) * 100) : 0;
  return { required, correct, wrong, percent, complete: required > 0 && correct === required };
}

export function remainingByColor(flatTarget, flatProgress) {
  const out = {};
  for (let i = 0; i < flatTarget.length; i++) {
    const t = flatTarget[i];
    if (!t) continue;
    if ((flatProgress[i] || 0) !== t) out[t] = (out[t] || 0) + 1;
  }
  return out;
}

const slugify = (value) =>
  String(value || "artwork")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "artwork";

export function downloadArtworkPng({ grid, palette, title, size }) {
  if (typeof document === "undefined") return;
  const n = size || grid?.length || 24;
  const px = Math.max(10, Math.round(1200 / n));
  const canvas = document.createElement("canvas");
  canvas.width = n * px;
  canvas.height = n * px;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < n; y++) {
    const row = grid?.[y] || [];
    for (let x = 0; x < n; x++) {
      const value = row[x];
      if (!value) continue;
      ctx.fillStyle = palette?.[value - 1] || "#ffffff";
      ctx.fillRect(x * px, y * px, px, px);
    }
  }
  const link = document.createElement("a");
  link.download = `${slugify(title)}.png`;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  link.remove();
}