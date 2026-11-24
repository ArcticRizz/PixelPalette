import { Link } from "@tanstack/react-router";
import { Images, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const MARK = ["#C4633B", "#E0A33F", "#7C8F7B", "#2F4F6B", "#E9DFC6", "#8A6A3A", "#F0B9A0", "#3F76B8", "#C9B48A"];

const NAV = "relative rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";
const NAV_ACTIVE =
  "relative rounded-full px-3.5 py-2 text-sm bg-secondary/70 after:absolute after:bottom-0.5 after:left-3.5 after:right-3.5 after:h-px after:bg-[hsl(var(--gold))]";

export function LogoMark() {
  return (
    <span className="grid grid-cols-3 gap-[3px] rounded-lg bg-foreground/[0.06] p-[5px] ring-1 ring-[hsl(var(--gold)/0.35)]">
      {MARK.map((color) => (
        <span key={color} className="h-[5px] w-[5px] rounded-[1.5px]" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}

export default function SiteHeader() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <LogoMark />
          <span className="font-display text-[17px] font-semibold tracking-tight">Pixel &amp; Pigment</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" activeOptions={{ exact: true }} className={NAV} activeProps={{ className: NAV_ACTIVE }}>
            Gallery
          </Link>
          <Link to="/creations" className={NAV} activeProps={{ className: NAV_ACTIVE }}>
            My creations
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          {!isLoadingAuth && !isAuthenticated && (
            <button
              type="button"
              onClick={() => navigateToLogin()}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </button>
          )}
          {!isLoadingAuth && isAuthenticated && (
            <button
              type="button"
              onClick={() => logout()}
              title={user?.email || "Sign out"}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          )}
          <Link
            to="/creations"
            title="My creations"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Images className="h-4 w-4" />
          </Link>
          <Link
            to="/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_12px_24px_-14px_hsl(18_44%_24%)] ring-1 ring-transparent transition-all hover:bg-primary/90 hover:ring-[hsl(var(--gold)/0.45)] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Create
          </Link>
        </div>
      </div>
      <div className="gold-hairline h-px w-full opacity-60" />
    </header>
  );
}