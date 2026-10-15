import { createFileRoute, redirect } from "@tanstack/react-router";

// Former demo page: kept as a permanent redirect so old links keep working.
export const Route = createFileRoute("/_shell/chat")({
  beforeLoad: () => { throw redirect({ to: "/assistant", replace: true }); },
});
