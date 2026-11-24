import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eraser, Loader2, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { rememberCreation } from "@/lib/progressStore";
import { MAX_COLORS } from "@/lib/gridCodec";
import { storeGrid } from "@/lib/mapStore";
import DesignerCanvas from "@/components/create/DesignerCanvas";
import { cn } from "@/lib/utils";

const STARTER = [
  "#C4633B", "#E0A33F", "#F2D7A0", "#7C8F7B",
  "#2F4F6B", "#3F76B8", "#8DC0E0", "#E8C9A6",
  "#8A6A4A", "#2B2620", "#F2F1EC", "#C9B48A",
];

const SIZES = [16, 24, 32, 48, 64, 96, 128, 256];

const difficultyFor = (colors) => (colors <= 8 ? "easy" : colors <= 14 ? "medium" : "hard");

const normalize = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
};

export default function PixelDesigner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const gridRef = useRef(null);
  const drawing = useRef(false);

  const [size, setSize] = useState(16);
  const [cells, setCells] = useState(() => new Array(16 * 16).fill(""));
  const [swatches, setSwatches] = useState(STARTER);
  const [color, setColor] = useState(STARTER[0]);
  const [draft, setDraft] = useState("#C4633B");
  const [erasing, setErasing] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stop = () => {
      drawing.current = false;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const usedColors = useMemo(() => {
    const counts = new Map();
    cells.forEach((hex) => {
      if (hex) counts.set(hex, (counts.get(hex) || 0) + 1);
    });
    return counts;
  }, [cells]);

  const changeSize = (next) => {
    if (next === size) return;
    setSize(next);
    setCells(new Array(next * next).fill(""));
  };

  const paintIndex = (index) => {
    const value = erasing ? "" : color;
    setCells((prev) => {
      if (prev[index] === value) return prev;
      const next = prev.slice();
      next[index] = value;
      return next;
    });
  };

  const paintAt = (event) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * size);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * size);
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    paintIndex(y * size + x);
  };

  const selectColor = (hex) => {
    setColor(hex);
    setErasing(false);
  };

  const addColor = (hex) => {
    if (!swatches.includes(hex) && swatches.length >= MAX_COLORS) {
      toast.error(`A map can hold ${MAX_COLORS} colours.`);
      return;
    }
    setSwatches((prev) => (prev.includes(hex) ? prev : [...prev, hex]));
    selectColor(hex);
  };

  const addDraft = () => {
    const hex = normalize(draft);
    if (!hex) {
      toast.error("Type a hex colour, like #C4633B.");
      return;
    }
    setDraft(hex);
    addColor(hex);
  };

  const removeColor = (hex) => {
    if (swatches.length <= 1 || usedColors.has(hex)) return;
    const next = swatches.filter((c) => c !== hex);
    setSwatches(next);
    if (color === hex) selectColor(next[0]);
  };

  const createPuzzle = async () => {
    if (!usedColors.size) {
      toast.error("Paint a few squares first.");
      return;
    }
    setSaving(true);
    try {
      const ordered = [...usedColors.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
      const numbers = new Map(ordered.map((hex, i) => [hex, i + 1]));
      const grid = [];
      for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
          const hex = cells[y * size + x];
          row.push(hex ? numbers.get(hex) : 0);
        }
        grid.push(row);
      }

      const stored = await storeGrid(grid);
      const created = await base44.entities.Artwork.create({
        title: title.trim() || "Drawn study",
        artist: user?.full_name || "Studio guest",
        author_name: user?.full_name || "Studio guest",
        source: "custom_drawn",
        difficulty: difficultyFor(ordered.length),
        grid_size: size,
        palette: ordered,
        ...stored,
        is_featured: false,
      });
      rememberCreation(created.id);
      navigate({ to: "/studio/$artworkId", params: { artworkId: created.id } });
    } catch {
      toast.error("Could not save this map. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="rounded-[1.5rem] border border-border/70 bg-card p-3 soft-shadow sm:p-4">
        {size <= 32 ? (
          <div
            ref={gridRef}
            className="grid touch-none select-none overflow-hidden rounded-[1rem] border border-border/60 bg-[#EDE7DC]"
            style={{
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gap: 1,
              aspectRatio: "1 / 1",
            }}
            onPointerDown={(e) => {
              drawing.current = true;
              paintAt(e);
            }}
            onPointerMove={(e) => {
              if (drawing.current) paintAt(e);
            }}
          >
            {cells.map((hex, index) => (
              <div
                key={index}
                style={{ backgroundColor: hex || "#FFFFFF" }}
                className="aspect-square"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : (
          <DesignerCanvas size={size} cells={cells} onPaint={paintIndex} />
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Grid</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeSize(option)}
                title={option === size ? "Current grid" : "Changing the grid clears the canvas"}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors",
                  size === option
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Colours</p>
            <span className="text-[11px] text-muted-foreground">{usedColors.size} in use</span>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => selectColor(hex)}
                className={cn(
                  "aspect-square rounded-full ring-1 ring-black/5 transition-all",
                  !erasing && color === hex
                    ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>

          <div className="mt-4 rounded-[1rem] border border-border/70 bg-background/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Add a colour</p>
            <div className="mt-2 flex items-center gap-2">
              <label
                className="relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-white"
                title="Pick a colour"
              >
                <span className="h-5 w-5 rounded-full" style={{ backgroundColor: normalize(draft) || color }} />
                <input
                  type="color"
                  value={normalize(draft) || color}
                  onChange={(e) => setDraft(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="#C4633B"
                className="w-full min-w-0 rounded-full border border-border bg-white px-3 py-2 font-mono text-xs uppercase outline-none transition-colors focus:border-primary/50"
              />
              <button
                type="button"
                onClick={addDraft}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Up to {MAX_COLORS} colours. Any hex you add becomes a numbered paint in the puzzle.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setErasing((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                erasing
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-white text-muted-foreground hover:text-foreground"
              )}
            >
              <Eraser className="h-3.5 w-3.5" />
              Eraser
            </button>
            <button
              type="button"
              onClick={() => removeColor(color)}
              disabled={swatches.length <= 1 || usedColors.has(color)}
              title={usedColors.has(color) ? "This colour is painted on the canvas" : "Remove this colour"}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
            <button
              type="button"
              onClick={() => setCells(new Array(size * size).fill(""))}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow">
          <label htmlFor="drawn-title" className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <input
            id="drawn-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Little house"
            className="mt-1.5 w-full rounded-full border border-border bg-background/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-white"
          />

          <button
            type="button"
            onClick={createPuzzle}
            disabled={saving}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Create puzzle
          </button>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Every colour you used becomes a numbered paint in the puzzle.
          </p>
        </div>
      </aside>
    </div>
  );
}