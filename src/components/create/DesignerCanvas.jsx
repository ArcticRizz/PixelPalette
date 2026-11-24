import { useEffect, useRef } from "react";

const EMPTY = "#FFFFFF";
const GRID = "#E7E0D2";

// The designer's painting surface for big grids: a canvas that only repaints the
// squares that changed, so 256x256 stays usable.
export default function DesignerCanvas({ size, cells, onPaint }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const prev = useRef(null);
  const cell = Math.max(2, Math.min(18, Math.floor(760 / size)));

  const paintCell = (ctx, index) => {
    const x = index % size;
    const y = (index - x) / size;
    const gap = cell >= 5 ? 1 : 0;
    ctx.fillStyle = cells[index] || EMPTY;
    ctx.fillRect(x * cell, y * cell, cell - gap, cell - gap);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = size * cell;
    const dpr = px > 1400 ? 1 : Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(px * dpr);
    canvas.height = Math.round(px * dpr);
    canvas.style.width = `${px}px`;
    canvas.style.height = `${px}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = GRID;
    ctx.fillRect(0, 0, px, px);
    for (let i = 0; i < size * size; i++) paintCell(ctx, i);
    prev.current = cells;
  }, [size, cell]);

  useEffect(() => {
    const before = prev.current;
    prev.current = cells;
    if (!before || before.length !== cells.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = canvas.width / (size * cell);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < cells.length; i++) if (cells[i] !== before[i]) paintCell(ctx, i);
  }, [cells]);

  const indexFrom = (event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return -1;
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * size);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * size);
    if (x < 0 || y < 0 || x >= size || y >= size) return -1;
    return y * size + x;
  };

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full cursor-crosshair touch-none rounded-[0.75rem] border border-border/60"
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          const index = indexFrom(event);
          if (index >= 0) onPaint(index);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const index = indexFrom(event);
          if (index >= 0) onPaint(index);
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
        onPointerLeave={() => {
          drawing.current = false;
        }}
      />
    </div>
  );
}