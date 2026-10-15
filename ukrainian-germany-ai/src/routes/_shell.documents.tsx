import { createFileRoute, redirect } from "@tanstack/react-router";

// Former demo pages (/documents and /documents/:id): redirect to the real letter list.
export const Route = createFileRoute("/_shell/documents")({
  beforeLoad: () => { throw redirect({ to: "/letters", replace: true }); },
});
