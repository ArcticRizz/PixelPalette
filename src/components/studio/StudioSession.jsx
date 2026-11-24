import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { ArrowLeft } from "lucide-react";
import StudioCanvas from "@/components/studio/StudioCanvas";
import StudioPalette from "@/components/studio/StudioPalette";
import StudioToolbar from "@/components/studio/StudioToolbar";
import CompletionCard from "@/components/studio/CompletionCard";
import useStudioEngine from "@/components/studio/useStudioEngine";
import { downloadArtworkPng } from "@/lib/pixel";

const CONFETTI_COLORS = ["#C4633B", "#E0A33F", "#7C8F7B", "#3F76B8", "#F2D7A0"];

export default function StudioSession({ artwork }) {
  const engine = useStudioEngine(artwork);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [moveMode, setMoveMode] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const celebrated = useRef(engine.stats.complete);

  const { complete, percent, required, correct } = engine.stats;

  useEffect(() => {
    if (!complete || celebrated.current) return;
    celebrated.current = true;
    setShowCompletion(true);
    confetti({
      particleCount: 90,
      spread: 72,
      startVelocity: 28,
      origin: { y: 0.62 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
  }, [complete]);

  const download = () =>
    downloadArtworkPng({
      grid: artwork.target_grid,
      palette: engine.palette,
      title: artwork.title,
      size: engine.size,
    });

  const maxZoom = engine.size > 160 ? 3 : engine.size > 96 ? 4 : 3;
  const zoomIn = () => setZoom((z) => Math.min(maxZoom, Math.round((z + 0.25) * 100) / 100));
  const zoomOut = () =>
    setZoom((z) => {
      const next = Math.max(1, Math.round((z - 0.25) * 100) / 100);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Gallery
        </Link>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {artwork.difficulty || "medium"} · {engine.size}×{engine.size}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="rounded-[1.5rem] border border-border/70 bg-card p-3 soft-shadow sm:p-4">
          <StudioToolbar
            showNumbers={engine.showNumbers}
            onToggleNumbers={() => engine.setShowNumbers((v) => !v)}
            strict={engine.strict}
            onToggleStrict={() => engine.setStrict((v) => !v)}
            moveMode={moveMode}
            onToggleMove={() => setMoveMode((v) => !v)}
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
            onHint={() => engine.hint()}
            onDownload={download}
          />

          <div className="relative mt-3">
            <StudioCanvas
              size={engine.size}
              palette={engine.palette}
              target={engine.target}
              progress={engine.progress}
              selected={engine.selected}
              showNumbers={engine.showNumbers}
              shakeCell={engine.shakeCell}
              complete={complete}
              moveMode={moveMode}
              onPaint={engine.paint}
              zoom={zoom}
              pan={pan}
              setPan={setPan}
            />
            {showCompletion && (
              <CompletionCard title={artwork.title} onDownload={download} onDismiss={() => setShowCompletion(false)} />
            )}
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Drag across squares to paint ·{" "}
            {engine.size >= 128
              ? `${(engine.size * engine.size).toLocaleString("en-US")} squares, so zoom in to work closely`
              : "pick a colour to light up its squares"}
          </p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow">
            <h1 className="font-display text-[22px] leading-tight tracking-tight">{artwork.title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {artwork.artist || "Your studio"}
              {artwork.year ? ` · ${artwork.year}` : ""}
            </p>

            <div className="mt-4">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium tabular-nums">{percent}%</span>
                <span className="text-muted-foreground">{required - correct} squares left</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {artwork.description && (
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">{artwork.description}</p>
            )}
          </div>

          <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 soft-shadow">
            <StudioPalette
              palette={engine.palette}
              selected={engine.selected}
              onSelect={engine.setSelected}
              remaining={engine.remaining}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}