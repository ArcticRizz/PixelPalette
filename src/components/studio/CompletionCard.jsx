import { Link } from "@tanstack/react-router";
import { Download, Sparkles } from "lucide-react";

export default function CompletionCard({ title, onDownload, onDismiss }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/55 p-4 backdrop-blur-[3px]">
      <div className="cbn-rise w-full max-w-[19rem] rounded-[1.35rem] border border-border bg-card p-6 text-center soft-shadow">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-display text-xl tracking-tight">Masterpiece complete</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {title} is finished — every square in its place.
        </p>

        <button
          type="button"
          onClick={onDownload}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99]"
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Keep looking
          </button>
          <Link
            to="/creations"
            className="flex-1 rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            My creations
          </Link>
        </div>
      </div>
    </div>
  );
}