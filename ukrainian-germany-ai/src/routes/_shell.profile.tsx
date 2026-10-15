import { createFileRoute, redirect } from "@tanstack/react-router";

// Former demo page: kept as a permanent redirect so old links keep working.
export const Route = createFileRoute("/_shell/profile")({
  beforeLoad: () => { throw redirect({ to: "/settings", replace: true }); },
});
