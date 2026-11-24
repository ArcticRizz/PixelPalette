import { memo, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/pixel";

const Cell = memo(function Cell({ targetValue, painted, palette, showNumbers, cell, selected, complete, shaking }) {
  const correct = painted > 0 && painted === targetValue;
  const wrong = painted > 0 && painted !== targetValue;
  const highlight = !painted && targetValue === selected;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", shaking && "cbn-shake")}
      style={{
        width: cell,
        height: cell,
        fontSize: Math.max(6, Math.round(cell * 0.42)),
        backgroundColor: correct
          ? palette[targetValue - 1] || "#ffffff"
          : wrong
            ? hexToRgba(palette[painted - 1], 0.35)
            : "#ffffff",
        boxShadow: complete ? "none" : "inset -1px -1px 0 0 #EDE7DC",
        transition: "background-color 160ms ease, box-shadow 700ms ease",
      }}
    >
      {highlight && (
        <span
          className="cbn-hint-pulse pointer-events-none absolute inset-0"
          style={{ backgroundColor: hexToRgba(palette[selected - 1] || "#ffffff", 0.5) }}
        />
      )}
      {!correct && showNumbers && targetValue > 0 && (
        <span className="relative z-10 font-medium tabular-nums text-[#3a3226]/55">{targetValue}</span>
      )}
      {wrong && <span className="absolute right-[1px] top-[1px] z-10 h-1 w-1 rounded-full bg-[#b8442a]" />}
    </div>
  );
});

// The crisp, cell-by-cell grid used for the smaller canvases.
export default function PixelCellGrid({
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
  const gridRef = useRef(null);
  const [cell, setCell] = useState(18);
  const [panning, setPanning] = useState(false);
  const drawing = useRef(false);
  const panStart = useRef(null);

  const indices = useMemo(() => Array.from({ length: size * size }, (_, i) => i), [size]);
  const numbersVisible = showNumbers && cell * zoom >= 12;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const base = Math.max(6, Math.floor(Math.min(rect.width, rect.height) / size));
      setCell(base);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size]);

  const indexFromEvent = (event) => {
    const rect = gridRef.current?.getBoundingClientRect();
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
          ref={gridRef}
          className={cn("grid", moveMode ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair")}
          style={{
            gridTemplateColumns: `repeat(${size}, ${cell}px)`,
            width: size * cell,
            height: size * cell,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: panning ? "none" : "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)",
            borderRadius: 3,
            overflow: "hidden",
          }}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {indices.map((index) => (
            <Cell
              key={index}
              targetValue={target[index]}
              painted={progress[index] || 0}
              palette={palette}
              showNumbers={numbersVisible}
              cell={cell}
              selected={selected}
              complete={complete}
              shaking={shakeCell === index}
            />
          ))}
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