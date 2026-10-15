import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shell/documents/$id")({
  beforeLoad: () => { throw redirect({ to: "/letters", replace: true }); },
});
