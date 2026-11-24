import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  beforeLoad: () => { throw redirect({ to: "/profiles", replace: true }); },
});
