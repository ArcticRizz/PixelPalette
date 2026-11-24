import { createFileRoute } from "@tanstack/react-router";
import ImageToGrid from "@/components/create/ImageToGrid";

export const Route = createFileRoute("/_site/create")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create from an image — Pixel & Pigment" },
      { name: "description", content: "Turn any photo into a numbered color-by-number pixel puzzle." },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <header className="max-w-xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Map maker</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">From an image</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Drop in a photo and we will break it into numbered squares. Choose how fine the grid is and how many colours
          you want to paint with — a soft, quiet picture makes a lovely evening canvas.
        </p>
      </header>

      <div className="mt-8">
        <ImageToGrid />
      </div>
    </div>
  );
}