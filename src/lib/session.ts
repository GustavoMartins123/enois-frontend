import type { SessionPayload } from "@/types/application/auth/session-payload";

import { setAuthHint } from "./auth-hint";
import { resetSessionScopedData } from "./query-client";
import { SESSION_FLAG_KEY, renewSessionKey } from "./session-key";

/** Keys that held the tokens before the cookie migration; removed once on load. */
const LEGACY_TOKEN_KEYS = ["session_token", "refresh_token"] as const;

export function hasSessionFlag(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_FLAG_KEY) === "1";
}

/**
 * Records the session in the same shape everywhere (login, confirmed signup, OAuth return).
 *
 * `current_user` lets the header show name and photo before /auth/me answers.
 */
export function storeSession({ expiresAt, refreshExpiresAt, user }: SessionPayload) {
  const wasActive = hasSessionFlag();
  localStorage.setItem(SESSION_FLAG_KEY, "1");
  if (expiresAt) localStorage.setItem("session_expires_at", expiresAt);
  if (refreshExpiresAt) localStorage.setItem("refresh_expires_at", refreshExpiresAt);
  if (user) localStorage.setItem("current_user", JSON.stringify(user));
  setAuthHint();
  if (!wasActive) {
    renewSessionKey();
    resetSessionScopedData();
  }
}

/**
 * Pulls the tokens out of localStorage, where any script on the origin could read them.
 *
 * Returns the legacy refresh token (if any) so the caller can trade it ONCE for the new cookies;
 * after this runs nothing token-like stays in storage.
 */
export function takeLegacyRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const refreshToken = localStorage.getItem("refresh_token");
  for (const key of LEGACY_TOKEN_KEYS) localStorage.removeItem(key);
  return refreshToken;
}
