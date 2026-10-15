import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
// Self-hosted fonts (no requests to Google Fonts — DSGVO).
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "@fontsource-variable/onest";

import { Toaster } from "@/components/ui/sonner";
import { LetterProvider, useOptionalLetter } from "@/components/app/LetterContext";
import { SplashScreen } from "@/components/app/SplashScreen";
import { LegalFooter } from "@/components/app/LegalFooter";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { rootCopy, uiLangFromDocument } from "../lib/root-copy";

function useRootCopy() {
  const ctx = useOptionalLetter();
  return rootCopy[ctx?.lang ?? uiLangFromDocument()];
}

function NotFoundComponent() {
  const t = useRootCopy();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t.notFoundTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t.notFoundText}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const t = useRootCopy();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{t.errorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.errorText}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.retry}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t.home}
          </a>
        </div>
      </div>
    </div>
  );
}

// AppShell already renders the footer inside its own stacking context, so the
// fixed bottom panel can cover it; standalone routes (e.g. /auth) render it here.
function RootFooter() {
  const inShell = useRouterState({ select: s => s.matches.some(m => m.routeId === "/_shell" || m.routeId === "/") });
  return inShell ? null : <LegalFooter />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ukrainian Germany AI" },
      { name: "description", content: "AI-помічник для українців у Німеччині: переклад листів, строки й відповідь німецькою." },
      { property: "og:title", content: "Ukrainian Germany AI" },
      { property: "og:description", content: "Зрозуміти лист. Розібратися. Зробити наступний крок." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <LetterProvider><SplashScreen /><Outlet /><RootFooter /></LetterProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
