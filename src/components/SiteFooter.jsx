import { Link } from "@tanstack/react-router";
import { LogoMark } from "@/components/SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <div>
            <p className="font-display text-sm font-semibold tracking-tight">Pixel &amp; Pigment</p>
            <p className="text-xs text-muted-foreground">A quiet studio for slow painting.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Gallery
          </Link>
          <Link to="/creations" className="transition-colors hover:text-foreground">
            My creations
          </Link>
          <Link to="/create" className="transition-colors hover:text-foreground">
            Create a map
          </Link>
        </div>
      </div>
    </footer>
  );
}