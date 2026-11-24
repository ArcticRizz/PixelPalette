import { HeadContent, Outlet, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";

export const Route = createRootRoute({
  head: () => ({ meta: [
    { title: "Pixel & Pigment — Color by Number Studio" },
    { name: "description", content: "Your personal colour-by-number studio. Draw, paint and save your creations on this device." },
  ] }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: () => <><HeadContent /><Toaster /><AuthProvider><Outlet /></AuthProvider></>,
});
