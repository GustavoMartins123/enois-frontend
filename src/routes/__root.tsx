import { useEffect } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

import { texts } from "@/texts";
import type { WithRequiredChildren } from "@/types/components/with-required-children";
import type { ErrorComponentProps } from "@/types/routes/root/error-component-props";
import type { RootRouteContext } from "@/types/routes/root/root-route-context";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">{texts.root.notFound.code}</h1>

        <h2 className="mt-4 text-xl font-semibold text-foreground">{texts.root.notFound.title}</h2>

        <p className="mt-2 text-sm text-muted-foreground">{texts.root.notFound.description}</p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {texts.root.notFound.home}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {texts.root.error.title}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">{texts.root.error.description}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {texts.root.error.retry}
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {texts.root.error.home}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: texts.root.seo.title },
      {
        name: "description",
        content: texts.root.seo.description,
      },
      { property: "og:title", content: texts.root.seo.title },
      {
        property: "og:description",
        content: texts.root.seo.ogDescription,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: WithRequiredChildren) {
  return (
    <html lang="en">
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

function OAuthCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const expiresAt = params.get("expiresAt");
    const refreshExpiresAt = params.get("refreshExpiresAt");
    if (token) {
      localStorage.setItem("session_token", token);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      if (expiresAt) localStorage.setItem("session_expires_at", expiresAt);
      if (refreshExpiresAt) localStorage.setItem("refresh_expires_at", refreshExpiresAt);
      navigate({ to: "/feed", replace: true });
    }
  }, [navigate]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <OAuthCallbackHandler />
      <Outlet />
    </QueryClientProvider>
  );
}
