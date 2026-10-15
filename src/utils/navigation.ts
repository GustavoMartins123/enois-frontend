import type { Navigate } from "@/types/navigation/navigate";
import type { RouteDefinition } from "@/types/navigation/route-definition";

const routeDefinitions = [
  // Notificação de post (comentário/reacção/menção) leva ao post real.
  { source: "feed/posts", to: "/post/$postId", params: ["postId"] },
  { source: "users", to: "/perfil/$username", params: ["username"] },
  { source: "network", to: "/rede" },
  { source: "conversations", to: "/mensagens" },
  {
    source: "communities",
    to: "/comunidades/$communityId",
    params: ["communityId"],
  },
  { source: "jobs", to: "/vagas" },
  { source: "events", to: "/eventos" },
  { source: "mentors", to: "/mentoria" },
  { source: "perfil", to: "/perfil/$username", params: ["username"] },
  {
    source: "comunidades",
    to: "/comunidades/$communityId",
    params: ["communityId"],
  },
  { source: "feed", to: "/feed" },
  { source: "rede", to: "/rede" },
  { source: "mensagens", to: "/mensagens" },
  { source: "vagas", to: "/vagas" },
  { source: "eventos", to: "/eventos" },
  { source: "mentoria", to: "/mentoria" },
] as const satisfies readonly RouteDefinition[];

const routes = [...routeDefinitions].sort((a, b) => b.source.length - a.source.length);

export function navigateToHref(href: string, navigate: Navigate) {
  const path = href.replace(/^\/api\//, "").replace(/^\/+|\/+$/g, "");

  // Notificação de mensagem traz o id da conversa: abre ela direto, não só a lista.
  const conversation = path.match(/^conversations\/([^/]+)$/);
  if (conversation) {
    navigate({ to: "/mensagens", search: { conversation: conversation[1] } });
    return;
  }

  const route = routes.find(({ source }) => path === source || path.startsWith(`${source}/`));

  if (!route) return;

  const values = path.slice(route.source.length).split("/").filter(Boolean);
  const paramNames = "params" in route ? route.params : [];

  if (values.length < paramNames.length) return;

  const params = Object.fromEntries(paramNames.map((name, index) => [name, values[index]]));

  navigate({
    to: route.to,
    ...(paramNames.length > 0 ? { params } : {}),
  });
}
