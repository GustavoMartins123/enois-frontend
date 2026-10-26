import { apiUrl } from "./api-client";

/** Providers the API registers a callback for; anything else never reaches the API path. */
const OAUTH_PROVIDERS = new Set(["google", "linkedin", "apple"]);

/**
 * API URL that finishes a provider login whose redirect_uri points at this page (LinkedIn), or
 * null when the provider is not one we know.
 */
export function oauthCallbackUrl(provider: string, code: string, state: string): string | null {
  const normalized = provider.toLowerCase();
  if (!OAUTH_PROVIDERS.has(normalized)) return null;
  const params = new URLSearchParams({ code, state });
  return apiUrl(`/auth/oauth/${normalized}/callback?${params.toString()}`);
}
