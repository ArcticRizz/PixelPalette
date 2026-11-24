// Rasterises a list of normalised shapes (0..1 space) into a numbered
// colour-by-number puzzle, so one composition works at every grid size.

function forEachCell(n, x0, y0, x1, y1, visit) {
  const cx0 = Math.max(0, Math.floor(x0 * n));
  const cx1 = Math.min(n, Math.ceil(x1 * n));
  const cy0 = Math.max(0, Math.floor(y0 * n));
  const cy1 = Math.min(n, Math.ceil(y1 * n));
  for (let cy = cy0; cy < cy1; cy += 1) {
    const py = (cy + 0.5) / n;
    for (let cx = cx0; cx < cx1; cx += 1) {
      visit(cx, cy, (cx + 0.5) / n, py);
    }
  }
}

function paint(grid, n, op) {
  const kind = op[0];

  if (kind === "rect") {
    const [, x, y, w, h, color] = op;
    forEachCell(n, x, y, x + w, y + h, (cx, cy, px, py) => {
      if (px >= x && px <= x + w && py >= y && py <= y + h) grid[cy][cx] = color;
    });
    return;
  }

  if (kind === "ellipse") {
    const [, ex, ey, rx, ry, color] = op;
    forEachCell(n, ex - rx, ey - ry, ex + rx, ey + ry, (cx, cy, px, py) => {
      const dx = (px - ex) / rx;
      const dy = (py - ey) / ry;
      if (dx * dx + dy * dy <= 1) grid[cy][cx] = color;
    });
    return;
  }

  if (kind === "line") {
    const [, x1, y1, x2, y2, color, width] = op;
    // never thinner than one square, so the stroke survives a coarse grid
    const reach = Math.max(width || 0, 1 / n) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = dx * dx + dy * dy || 1;
    forEachCell(
      n,
      Math.min(x1, x2) - reach,
      Math.min(y1, y2) - reach,
      Math.max(x1, x2) + reach,
      Math.max(y1, y2) + reach,
      (cx, cy, px, py) => {
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / length));
        const ex = px - (x1 + t * dx);
        const ey = py - (y1 + t * dy);
        if (ex * ex + ey * ey <= reach * reach) grid[cy][cx] = color;
      }
    );
    return;
  }

  if (kind === "poly") {
    const [, points, color] = op;
    const xs = points.map((point) => point[0]);
    const ys = points.map((point) => point[1]);
    forEachCell(n, Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), (cx, cy, px, py) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
      }
      if (inside) grid[cy][cx] = color;
    });
    return;
  }

  if (kind === "dots") {
    const [, points, color, radius] = op;
    const r = Math.max(radius || 0, 0.5 / n);
    points.forEach(([dx, dy]) => {
      forEachCell(n, dx - r, dy - r, dx + r, dy + r, (cx, cy, px, py) => {
        const ex = px - dx;
        const ey = py - dy;
        if (ex * ex + ey * ey <= r * r) grid[cy][cx] = color;
      });
    });
  }
}

export function toPuzzle(size, ops) {
  const n = Math.max(4, Math.round(size));
  const cells = Array.from({ length: n }, () => new Array(n).fill(null));

  ops.forEach((op) => paint(cells, n, op));

  const counts = new Map();
  cells.forEach((row) =>
    row.forEach((hex) => {
      if (!hex) return;
      const key = hex.toUpperCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    })
  );

  // the colours that cover the most squares come first, so the puzzle leans on
  // a handful of numbers instead of a long tail of one-off ones
  const palette = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const index = new Map(palette.map((hex, i) => [hex, i + 1]));

  return {
    palette,
    target_grid: cells.map((row) => row.map((hex) => (hex ? index.get(hex.toUpperCase()) || 0 : 0))),
  };
}