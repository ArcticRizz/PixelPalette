import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ImagePlus, Loader2, Palette as PaletteIcon, Play, Save, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import PixelCover from "@/components/PixelCover";
import { imageToGrid } from "@/lib/quantize";
import { storeGrid } from "@/lib/mapStore";
import { rememberCreation } from "@/lib/progressStore";

const difficultyFor = (colors) => (colors <= 8 ? "easy" : colors <= 14 ? "medium" : "hard");

export default function ImageToGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);
  const objectUrl = useRef("");

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [gridSize, setGridSize] = useState(24);
  const [maxColors, setMaxColors] = useState(12);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    []
  );

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a JPG or PNG image.");
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const url = URL.createObjectURL(file);
    objectUrl.current = url;

    const img = new Image();
    img.onload = () => {
      setImage(img);
      setPreviewUrl(url);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 48));
    };
    img.onerror = () => toast.error("That image could not be opened.");
    img.src = url;
  };

  useEffect(() => {
    if (!image) {
      setResult(null);
      return undefined;
    }
    setBusy(true);
    const timer = setTimeout(() => {
      try {
        setResult(imageToGrid(image, gridSize, maxColors));
      } catch {
        toast.error("Could not read that image.");
      } finally {
        setBusy(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [image, gridSize, maxColors]);

  const save = async (mode) => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const stored = await storeGrid(result.grid);
      const created = await base44.entities.Artwork.create({
        title: title.trim() || "Untitled study",
        artist: user?.full_name || "Studio guest",
        author_name: user?.full_name || "Studio guest",
        source: "custom_image",
        difficulty: difficultyFor(result.palette.length),
        grid_size: result.grid.length,
        palette: result.palette,
        ...stored,
        is_featured: false,
      });
      rememberCreation(created.id);
      navigate({
        to: mode === "play" ? "/studio/$artworkId" : "/creations",
        params: mode === "play" ? { artworkId: created.id } : undefined,
      });
    } catch {
      toast.error("Could not save this map. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-start">
      {/* Upload + settings */}
      <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step one</p>
        <h2 className="mt-1.5 font-display text-xl tracking-tight">Choose a picture</h2>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="mt-4 rounded-[1.15rem] border border-dashed border-border bg-background/60 p-4"
        >
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Your uploaded picture"
                className="mx-auto max-h-64 w-auto rounded-[0.9rem] object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreviewUrl("");
                  setResult(null);
                  if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                  objectUrl.current = "";
                }}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-[0.9rem] py-10 text-center transition-colors hover:bg-white/70"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">Drop an image, or browse</span>
              <span className="text-xs text-muted-foreground">JPG or PNG · square crops look best</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="grid-size" className="text-sm font-medium">
                Grid resolution
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {gridSize}×{gridSize}
              </span>
            </div>
            <input
              id="grid-size"
              type="range"
              min={12}
              max={256}
              step={4}
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="mt-2 w-full accent-[hsl(17_54%_50%)]"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>Quicker</span>
              <span>Finer</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="max-colors" className="text-sm font-medium">
                Maximum colours
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">{maxColors}</span>
            </div>
            <input
              id="max-colors"
              type="range"
              min={4}
              max={24}
              step={1}
              value={maxColors}
              onChange={(e) => setMaxColors(Number(e.target.value))}
              className="mt-2 w-full accent-[hsl(17_54%_50%)]"
            />
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>Fewer</span>
              <span>Richer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step two</p>
            <h2 className="mt-1.5 font-display text-xl tracking-tight">Your numbered map</h2>
          </div>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        <div className="mt-4 aspect-square w-full overflow-hidden rounded-[1.15rem] border border-border/60 bg-[#F4EFE6]">
          {result ? (
            <PixelCover grid={result.grid} palette={result.palette} className="h-full w-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <PaletteIcon className="h-5 w-5" />
              {image ? "Working on it…" : "Your map appears here"}
            </div>
          )}
        </div>

        {result && (
          <>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {result.palette.map((hex, i) => (
                <span
                  key={`${hex}-${i}`}
                  className="h-6 w-6 rounded-full ring-1 ring-black/5"
                  style={{ backgroundColor: hex }}
                  title={`Colour ${i + 1}`}
                />
              ))}
            </div>

            <div className="mt-5">
              <label htmlFor="map-title" className="text-xs font-medium text-muted-foreground">
                Title
              </label>
              <input
                id="map-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sunday kitchen"
                className="mt-1.5 w-full rounded-full border border-border bg-background/70 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:bg-white"
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => save("play")}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Save &amp; start painting
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save("gallery")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Save to gallery
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}