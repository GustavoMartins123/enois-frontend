export function navigateToHref(
  href: string,
  navigate: (opts: { to: string; params?: Record<string, string> }) => void,
) {
  if (href.startsWith("/api/feed/posts/")) {
    navigate({ to: "/feed" });
    return;
  }
  if (href.startsWith("/api/users/")) {
    const username = href.replace("/api/users/", "");
    if (username) {
      navigate({ to: "/perfil/$username", params: { username } });
      return;
    }
  }
  if (href.startsWith("/api/communities/")) {
    const id = href.replace("/api/communities/", "");
    if (id) {
      navigate({ to: "/comunidades/$communityId", params: { communityId: id } });
      return;
    }
  }
  if (href.startsWith("/api/jobs/")) {
    navigate({ to: "/vagas" });
    return;
  }
  if (href.startsWith("/api/events/")) {
    navigate({ to: "/eventos" });
    return;
  }
  if (href.startsWith("/api/mentors/")) {
    navigate({ to: "/mentoria" });
    return;
  }
  if (href.startsWith("/perfil/")) {
    const username = href.replace("/perfil/", "");
    if (username) {
      navigate({ to: "/perfil/$username", params: { username } });
      return;
    }
  }
  if (href.startsWith("/comunidades/")) {
    const communityId = href.replace("/comunidades/", "");
    if (communityId) {
      navigate({ to: "/comunidades/$communityId", params: { communityId } });
      return;
    }
  }
  const listRoutes = [
    "/feed",
    "/rede",
    "/mensagens",
    "/vagas",
    "/comunidades",
    "/eventos",
    "/mentoria",
  ] as const;
  for (const route of listRoutes) {
    if (href === route || href.startsWith(route + "/")) {
      navigate({ to: route });
      return;
    }
  }
  navigate({ to: "/feed" });
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
