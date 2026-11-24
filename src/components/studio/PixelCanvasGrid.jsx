import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/pixel";

const GRID_LINE = "#EDE7DC";
const MAX_CANVAS = 3000;

// Big canvases are painted to a single <canvas>: tens of thousands of squares
// stay smooth, and only the cells that changed are repainted while you paint.
export default function PixelCanvasGrid({
  size,
  palette,
  target,
  progress,
  selected,
  showNumbers,
  shakeCell,
  complete,
  moveMode,
  onPaint,
  zoom,
  pan,
  setPan,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [base, setBase] = useState(2);
  const [panning, setPanning] = useState(false);
  const drawing = useRef(false);
  const panStart = useRef(null);
  const prevProgress = useRef(null);
  const lastShake = useRef(-1);

  const maxCell = Math.max(2, Math.floor(MAX_CANVAS / size));
  const cell = Math.max(2, Math.min(Math.round(base * zoom), maxCell));
  const numbersVisible = showNumbers && cell >= 7;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const fit = Math.floor(Math.min(rect.width, rect.height) / size);
      setBase(Math.max(2, fit || 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size]);

  const paintCell = (ctx, index, flash) => {
    const x = index % size;
    const y = (index - x) / size;
    const t = target[index] || 0;
    const p = progress[index] || 0;
    const correct = p > 0 && p === t;
    const wrong = p > 0 && p !== t;
    // Small cells still need boundaries; only the finished artwork hides them.
    const gap = complete ? 0 : 1;

    let fill = "#ffffff";
    if (correct) fill = palette[t - 1] || "#ffffff";
    else if (wrong) fill = hexToRgba(palette[p - 1] || "#ffffff", 0.35);
    else if (!p && t === selected) fill = hexToRgba(palette[selected - 1] || "#ffffff", 0.5);

    ctx.fillStyle = fill;
    ctx.fillRect(x * cell, y * cell, cell - gap, cell - gap);

    if (!correct && numbersVisible && t > 0) {
      ctx.fillStyle = "rgba(58,50,38,0.55)";
      ctx.font = `500 ${Math.max(6, Math.round(cell * 0.52))}px Inter, ui-sans-serif, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(t), x * cell + (cell - gap) / 2, y * cell + (cell - gap) / 2 + 0.5);
    }

    if (wrong && cell >= 6) {
      ctx.fillStyle = "#b8442a";
      ctx.fillRect(x * cell + cell - 3, y * cell + 1, 2, 2);
    }

    if (flash) {
      ctx.strokeStyle = "#b8442a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
    }
  };

  // full repaint whenever the view or the palette state changes
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
    ctx.fillStyle = GRID_LINE;
    ctx.fillRect(0, 0, px, px);
    for (let i = 0; i < size * size; i++) paintCell(ctx, i, false);
    prevProgress.current = progress;
  }, [size, cell, complete, numbersVisible, selected, palette, target]);

  // then only the squares that actually changed
  useEffect(() => {
    const before = prevProgress.current;
    prevProgress.current = progress;
    if (!before || before.length !== progress.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = canvas.width / (size * cell);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < progress.length; i++) {
      if (progress[i] !== before[i]) paintCell(ctx, i, false);
    }
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = canvas.width / (size * cell);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (lastShake.current >= 0) paintCell(ctx, lastShake.current, false);
    if (shakeCell >= 0) paintCell(ctx, shakeCell, true);
    lastShake.current = shakeCell;
  }, [shakeCell]);

  const indexFromEvent = (event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return -1;
    const x = ((event.clientX - rect.left) / rect.width) * size;
    const y = ((event.clientY - rect.top) / rect.height) * size;
    if (x < 0 || y < 0 || x >= size || y >= size) return -1;
    return Math.floor(y) * size + Math.floor(x);
  };

  const handleDown = (event) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    if (moveMode) {
      panStart.current = { x: event.clientX - pan.x, y: event.clientY - pan.y };
      setPanning(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      return;
    }
    drawing.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const index = indexFromEvent(event);
    if (index >= 0) onPaint(index);
  };

  const handleMove = (event) => {
    if (panStart.current) {
      setPan({ x: event.clientX - panStart.current.x, y: event.clientY - panStart.current.y });
      return;
    }
    if (!drawing.current) return;
    const index = indexFromEvent(event);
    if (index >= 0) onPaint(index);
  };

  const endDrag = () => {
    drawing.current = false;
    panStart.current = null;
    setPanning(false);
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square w-full touch-none select-none overflow-hidden rounded-[1.15rem] border border-border/70 bg-[#FBFAF7]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: panning ? "none" : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <canvas
            ref={canvasRef}
            className={cn("block rounded-[3px]", moveMode ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair")}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          />
        </div>
      </div>
      {showNumbers && !numbersVisible && (
        <span className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-medium text-background">
          Zoom in to read the numbers
        </span>
      )}
    </div>
  );
}