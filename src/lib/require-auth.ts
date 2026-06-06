import { redirect } from "@tanstack/react-router";

export function requireAuth() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("session_token");
  if (!token) {
    throw redirect({ to: "/entrar", search: { tab: "login" } });
  }
}
