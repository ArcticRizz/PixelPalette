import { Download, Hand, Hash, Maximize2, ShieldCheck, ShieldOff, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

function ToolButton({ onClick, active, icon: Icon, label, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
        active
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border/80 bg-white text-muted-foreground hover:border-border hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function StudioToolbar({
  showNumbers,
  onToggleNumbers,
  strict,
  onToggleStrict,
  moveMode,
  onToggleMove,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onHint,
  onDownload,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ToolButton
        onClick={onHint}
        icon={Sparkles}
        label="Hint"
        title="Fill one square of the selected colour"
      />
      <ToolButton
        onClick={onToggleNumbers}
        active={showNumbers}
        icon={Hash}
        label="Numbers"
        title="Show or hide the numbers"
      />
      <ToolButton
        onClick={onToggleStrict}
        active={strict}
        icon={strict ? ShieldCheck : ShieldOff}
        label={strict ? "Strict" : "Free"}
        title={
          strict
            ? "Strict: a wrong colour is blocked. Click to allow free painting."
            : "Free: wrong colours show as a tint. Click to switch to strict."
        }
      />
      <ToolButton
        onClick={onToggleMove}
        active={moveMode}
        icon={Hand}
        label="Move"
        title="Drag to pan the canvas"
      />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={onZoomOut}
          title="Zoom out"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-white text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-[11px] tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          title="Zoom in"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-white text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onResetView}
          title="Reset the view"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-white text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDownload}
          title="Download a PNG"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/80 bg-white px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">PNG</span>
        </button>
      </div>
    </div>
  );
}