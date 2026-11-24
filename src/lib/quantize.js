function nearest(point, centers) {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < centers.length; i++) {
    const c = centers[i];
    const dr = point[0] - c[0];
    const dg = point[1] - c[1];
    const db = point[2] - c[2];
    const distance = dr * dr + dg * dg + db * db;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best;
}

function kmeans(points, k, iterations = 10) {
  const centers = [];
  const step = Math.max(1, Math.floor(points.length / k));
  for (let i = 0; i < k; i++) {
    const source = points[Math.min(points.length - 1, i * step)] || [0, 0, 0];
    centers.push([source[0], source[1], source[2]]);
  }

  for (let pass = 0; pass < iterations; pass++) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let p = 0; p < points.length; p++) {
      const index = nearest(points[p], centers);
      const bucket = sums[index];
      bucket[0] += points[p][0];
      bucket[1] += points[p][1];
      bucket[2] += points[p][2];
      bucket[3] += 1;
    }
    for (let i = 0; i < centers.length; i++) {
      const bucket = sums[i];
      if (bucket[3] > 0) {
        centers[i][0] = bucket[0] / bucket[3];
        centers[i][1] = bucket[1] / bucket[3];
        centers[i][2] = bucket[2] / bucket[3];
      }
    }
  }

  return centers;
}

const toHex = (rgb) =>
  `#${rgb
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("")}`;

/**
 * Reads an image element and returns { palette, grid } for a gridSize x gridSize puzzle.
 */
export function imageToGrid(image, gridSize, maxColors) {
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;
  ctx.drawImage(image, sx, sy, side, side, 0, 0, gridSize, gridSize);

  const { data } = ctx.getImageData(0, 0, gridSize, gridSize);
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  const k = Math.max(2, Math.min(maxColors, gridSize * gridSize));
  // big grids have far more pixels, so fewer refinement passes keep it quick
  const centers = kmeans(pixels, k, gridSize > 96 ? 4 : gridSize > 48 ? 6 : 10);

  // number the colours by how much of the canvas they cover
  const counts = new Array(centers.length).fill(0);
  const assigned = pixels.map((pixel) => {
    const index = nearest(pixel, centers);
    counts[index] += 1;
    return index;
  });

  const order = centers
    .map((center, index) => ({ center, index, count: counts[index] }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const palette = order.map((entry) => toHex(entry.center));
  const numberFor = new Map(order.map((entry, position) => [entry.index, position + 1]));

  const grid = [];
  for (let y = 0; y < gridSize; y++) {
    const row = [];
    for (let x = 0; x < gridSize; x++) {
      row.push(numberFor.get(assigned[y * gridSize + x]) || 1);
    }
    grid.push(row);
  }

  return { palette, grid };
}