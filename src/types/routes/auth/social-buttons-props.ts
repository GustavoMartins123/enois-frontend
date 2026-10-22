import type { OAuthMode } from "@/types/application/auth/oauth-mode";

export type SocialButtonsProps = {
  /** Aba em que a pessoa está: muda o rótulo do botão e o que o backend faz com o e-mail. */
  mode: OAuthMode;
};
