import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import {
  AtSign,
  Bell,
  Bookmark,
  Briefcase,
  Calendar,
  CheckCheck,
  Compass,
  GraduationCap,
  Heart,
  Home,
  Loader2,
  LogIn,
  MessageCircle,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { networkApi, notificationsApi, profileApi, searchApi } from "@/lib/api";
import type { Notification } from "@/lib/api";
import { isAuthenticated } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";

function navigateToHref(
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

const nav = [
  { to: "/feed", label: "Início", icon: Home },
  { to: "/rede", label: "Rede", icon: Users },
  { to: "/comunidades", label: "Comunidades", icon: Compass },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/salvos", label: "Salvos", icon: Bookmark },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/mentoria", label: "Mentoria", icon: GraduationCap },
  { to: "/eventos", label: "Eventos", icon: Calendar },
];

const notificationMeta: Record<string, { icon: React.ElementType; className: string }> = {
  connection: { icon: UserPlus, className: "bg-primary-soft text-primary" },
  connection_request: { icon: UserPlus, className: "bg-primary-soft text-primary" },
  connection_accepted: { icon: UserPlus, className: "bg-growth/15 text-growth" },
  message: { icon: MessageCircle, className: "bg-secondary/30 text-secondary-foreground" },
  mention: { icon: AtSign, className: "bg-accent text-accent-foreground" },
  new_comment: { icon: MessageCircle, className: "bg-primary-soft text-primary" },
  new_reaction: { icon: Heart, className: "bg-accent text-accent-foreground" },
  event: { icon: Calendar, className: "bg-growth/15 text-growth" },
  job: { icon: Briefcase, className: "bg-opportunity/20 text-opportunity-foreground" },
  mentoring: { icon: GraduationCap, className: "bg-primary-soft text-primary" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const [notifTab, setNotifTab] = useState<"novas" | "historico">("novas");

  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: () => profileApi.me(),
    enabled: authenticated,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(),
    enabled: authenticated,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notificationList = useMemo(() => notificationsData?.items ?? [], [notificationsData]);
  const unreadCount = useMemo(
    () => notificationList.filter((n) => !n.read).length,
    [notificationList],
  );
  const displayedNotifications = useMemo(
    () => notificationList.filter((n) => (notifTab === "novas" ? !n.read : n.read)),
    [notificationList, notifTab],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border-soft bg-surface-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
          <Link to="/feed" className="flex shrink-0 items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground sm:h-9 sm:w-9"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-[17px] font-light tracking-tight text-text-strong">Conexão</span>
          </Link>

          {authenticated && <SearchBox />}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {authenticated ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="relative grid h-10 w-10 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary"
                      aria-label={
                        unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"
                      }
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-medium leading-none text-primary-foreground">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border-border-soft bg-surface-card p-0 shadow-card"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
                      <span className="text-[14px] font-light text-text-strong">Notificações</span>
                      {unreadCount > 0 && notifTab === "novas" && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead.mutate()}
                          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-light text-text-subtle transition hover:text-primary"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Ler tudo
                        </button>
                      )}
                    </div>

                    <div className="flex border-b border-border-soft">
                      <button
                        type="button"
                        onClick={() => setNotifTab("novas")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-light transition",
                          notifTab === "novas"
                            ? "border-b-2 border-primary text-primary"
                            : "text-text-subtle hover:text-text-strong",
                        )}
                      >
                        Novas
                        {unreadCount > 0 && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifTab("historico")}
                        className={cn(
                          "flex-1 py-2.5 text-[12px] font-light transition",
                          notifTab === "historico"
                            ? "border-b-2 border-primary text-primary"
                            : "text-text-subtle hover:text-text-strong",
                        )}
                      >
                        Histórico
                      </button>
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto">
                      {displayedNotifications.length === 0 && (
                        <p className="px-4 py-8 text-center text-[13px] font-light text-text-subtle">
                          {notifTab === "novas"
                            ? "Nenhuma notificação nova."
                            : "Nenhum histórico ainda."}
                        </p>
                      )}
                      {displayedNotifications.map((notification) => {
                        const meta =
                          notificationMeta[notification.kind.toLowerCase()] ??
                          notificationMeta.connection;
                        const Icon = meta.icon;

                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              "border-b border-border-soft px-4 py-3 last:border-b-0",
                              notification.read ? "bg-surface-card" : "bg-surface-3",
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!notification.read) markAsRead.mutate(notification.id);
                                  navigateToHref(notification.href, navigate);
                                }}
                                className="shrink-0 rounded-full transition hover:opacity-80"
                              >
                                {notification.actorAvatar ? (
                                  <img
                                    src={notification.actorAvatar}
                                    alt={notification.actorName ?? ""}
                                    className="h-9 w-9 rounded-full object-cover"
                                  />
                                ) : (
                                  <span
                                    className={cn(
                                      "grid h-9 w-9 place-items-center rounded-full",
                                      meta.className,
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-[13px] font-light leading-tight text-text-strong">
                                    {notification.actorName && (
                                      <span>{notification.actorName} </span>
                                    )}
                                    <span className="text-text-subtle">
                                      {notification.title.toLowerCase()}
                                    </span>
                                  </p>
                                  {!notification.read && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                  )}
                                </div>
                                <p className="mt-1 break-words text-[13px] font-light leading-snug text-text-subtle">
                                  {notification.body}
                                </p>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-light text-text-subtle">
                                    {formatTime(notification.createdAt)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <button
                                        type="button"
                                        onClick={() => markAsRead.mutate(notification.id)}
                                        className="rounded-full px-2 py-1 text-[11px] font-light text-text-subtle transition hover:bg-surface-2 hover:text-text-strong"
                                      >
                                        Lida
                                      </button>
                                    )}
                                    {notification.ctaLabel === "Aceitar" &&
                                    !!notification.actorId ? (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!notification.read)
                                            markAsRead.mutate(notification.id);
                                          try {
                                            await networkApi.accept(notification.actorId!);
                                            queryClient.invalidateQueries({
                                              queryKey: ["network"],
                                            });
                                          } catch {}
                                        }}
                                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                                      >
                                        Aceitar
                                      </button>
                                    ) : notification.ctaLabel &&
                                      notification.ctaLabel !== "Aceitar" ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!notification.read)
                                            markAsRead.mutate(notification.id);
                                          navigateToHref(notification.href, navigate);
                                        }}
                                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-light text-primary-foreground transition hover:bg-primary/90"
                                      >
                                        {notification.ctaLabel}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                {profile && (
                  <Link
                    to="/perfil/$username"
                    params={{ username: profile.username }}
                    className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-surface-2"
                  >
                    <UserAvatar src={profile.avatar} alt={profile.name} className="h-8 w-8" />
                    <span className="hidden text-[13px] font-light text-text-strong sm:inline">
                      Perfil
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <Button
                onClick={() => navigate({ to: "/entrar", search: { tab: "login" } })}
                className="rounded-full gap-1.5"
                size="sm"
              >
                <LogIn className="h-4 w-4" /> Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-3 py-4 pb-24 sm:px-6 sm:py-6 lg:pb-6">
        {authenticated && (
          <aside className="sticky top-20 hidden h-fit w-60 shrink-0 lg:block">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl border-l-2 py-3 pl-3 pr-3 text-[14px] font-light transition",
                      active
                        ? "border-primary bg-surface-2 text-primary"
                        : "border-transparent text-text-subtle hover:bg-surface-3 hover:text-text-strong",
                    )}
                  >
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {authenticated && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface-card/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-w-[64px] shrink-0 flex-col items-center gap-0.5 whitespace-nowrap px-2 py-2 text-[10px] font-light",
                    active ? "text-primary" : "text-text-subtle",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function SearchBox() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (desktopRef.current && !desktopRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: results, isFetching } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchApi.search(debounced),
    enabled: debounced.length >= 2,
  });

  const items = results?.items ?? [];

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="ml-auto grid h-9 w-9 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary md:hidden"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" />
      </button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 pt-4 backdrop-blur-sm md:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMobileOpen(false);
              setOpen(false);
              setQuery("");
            }
          }}
        >
          <div ref={mobileRef} className="relative w-full max-w-md px-4">
            <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar pessoas, comunidades, vagas..."
              className="h-12 rounded-full border-border-soft bg-surface-card pl-10 pr-4 focus-visible:border-primary"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-subtle" />
            )}
            {open && debounced.length >= 2 && (
              <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-card">
                {items.length === 0 && !isFetching && (
                  <p className="px-4 py-6 text-center text-sm text-text-subtle">
                    Nenhum resultado para "{debounced}"
                  </p>
                )}
                <ul className="max-h-80 overflow-y-auto">
                  {items.map((item) => {
                    const close = () => {
                      setOpen(false);
                      setQuery("");
                      setMobileOpen(false);
                    };
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          onClick={() => {
                            close();
                            navigateToHref(item.href, navigate);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-3"
                        >
                          <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-light text-text-strong">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-text-subtle">{item.subtitle}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <div ref={desktopRef} className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-subtle" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar pessoas, comunidades, vagas..."
          className="h-10 rounded-full border-border-soft bg-surface-1 pl-9 focus-visible:border-primary"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-subtle" />
        )}
        {open && debounced.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-border-soft bg-surface-card shadow-card">
            {items.length === 0 && !isFetching && (
              <p className="px-4 py-6 text-center text-sm text-text-subtle">
                Nenhum resultado para "{debounced}"
              </p>
            )}
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => {
                const close = () => {
                  setOpen(false);
                  setQuery("");
                };
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      onClick={() => {
                        close();
                        navigateToHref(item.href, navigate);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-3"
                    >
                      <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-light text-text-strong">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-text-subtle">{item.subtitle}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function formatTime(iso: string | null | undefined): string {
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
