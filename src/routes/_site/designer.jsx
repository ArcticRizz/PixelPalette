import { createFileRoute } from "@tanstack/react-router";
import PixelDesigner from "@/components/create/PixelDesigner";

export const Route = createFileRoute("/_site/designer")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Draw a pixel map — Pixel & Pigment" },
      { name: "description", content: "Draw pixel art from a blank grid and play it back as a color-by-number puzzle." },
    ],
  }),
  component: DesignerPage,
});

function DesignerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <header className="max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Map maker</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">From scratch</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sketch something small and quiet — a cup, a cat, a window at dusk. When you are happy with it, it becomes a
          numbered puzzle you can paint slowly.
        </p>
      </header>

      <div className="mt-8">
        <PixelDesigner />
      </div>
    </div>
  );
}