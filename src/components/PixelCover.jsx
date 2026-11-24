import { useEffect, useRef } from "react";

/**
 * Draws a color grid onto a canvas. Used for gallery covers and previews.
 */
export default function PixelCover({ grid, palette, className = "", pixel }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !Array.isArray(grid) || !grid.length || !palette?.length) return;
    const n = grid.length;
    // keep the backing canvas modest for very large maps
    const px = pixel || (n > 96 ? 4 : n > 48 ? 6 : 10);
    canvas.width = n * px;
    canvas.height = n * px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < n; y++) {
      const row = grid[y] || [];
      for (let x = 0; x < n; x++) {
        const value = row[x];
        if (!value) continue;
        ctx.fillStyle = palette[value - 1] || "#ffffff";
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
  }, [grid, palette, pixel]);

  return <canvas ref={ref} className={className} style={{ imageRendering: "pixelated" }} />;
}