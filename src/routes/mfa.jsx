import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/mfa")({
  beforeLoad: () => { throw redirect({ to: "/profiles", replace: true }); },
});
