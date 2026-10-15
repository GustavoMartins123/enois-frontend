import { useEffect, useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { texts } from "@/texts";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  token: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional(),
  refreshExpiresAt: z.string().optional(),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: searchSchema,
  component: OAuthCallback,
});

function OAuthCallback() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!search.token) {
      setError(texts.auth.social.callbackError);
      return;
    }
    localStorage.setItem("session_token", search.token);
    if (search.refreshToken) localStorage.setItem("refresh_token", search.refreshToken);
    if (search.expiresAt) localStorage.setItem("session_expires_at", search.expiresAt);
    if (search.refreshExpiresAt)
      localStorage.setItem("refresh_expires_at", search.refreshExpiresAt);
    navigate({ to: "/feed", replace: true });
  }, [search, navigate]);

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div
          className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>

        {error ? (
          <>
            <h1 className="mt-4 text-lg font-semibold tracking-tight">{error}</h1>

            <Button
              className="mt-6 w-full gap-2 rounded-full"
              onClick={() => navigate({ to: "/entrar", search: { tab: "login" } })}
            >
              {texts.common.enter}
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mt-4 h-6 w-6 animate-spin text-primary" />

            <p className="mt-2 text-sm text-muted-foreground">
              {texts.auth.social.callbackLoading}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
