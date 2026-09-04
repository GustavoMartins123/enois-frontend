type Navigate = (opts: { to: string; params?: Record<string, string> }) => void;

type RouteDefinition = {
  source: string;
  to: string;
  params?: readonly string[];
};

const routeDefinitions = [
  { source: "feed/posts", to: "/feed" },
  { source: "users", to: "/perfil/$username", params: ["username"] },
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
  const route = routes.find(
    ({ source }) => path === source || path.startsWith(`${source}/`),
  );

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

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `há ${diffD} dias`;
  return date.toLocaleDateString("pt-BR");
}
