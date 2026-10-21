export type AuthConfig = {
  captchaMode: "TURNSTILE" | "CHALLENGE" | "NONE";
  turnstileSiteKey: string | null;
};
