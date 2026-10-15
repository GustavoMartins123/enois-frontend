import { redirect } from "@tanstack/react-router";

/**
 * Rotas que exigem sessao. Precisa espelhar o `beforeLoad: requireAuth` declarado nas rotas:
 * o guard de rota roda no SSR, onde nao existe localStorage, entao quem abre uma URL protegida
 * direto (deep link / aba restaurada) precisa ser barrado no cliente — ver o guard em __root.tsx.
 */
const PROTECTED_ROUTES = [
  "/feed",
  "/rede",
  "/salvos",
  "/mensagens",
  "/vagas",
  "/comunidades",
  "/eventos",
  "/mentoria",
  "/perfil",
  "/post",
  "/suporte",
  "/bloqueados",
];

export function hasSession(): boolean {
  if (typeof window === "undefined") return true;
  return Boolean(localStorage.getItem("session_token"));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Usado no `beforeLoad` das rotas: redireciona para o login quando nao ha sessao no cliente. */
export function requireAuth() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("session_token")) {
    throw redirect({ to: "/entrar", search: { tab: "login" } });
  }
}
