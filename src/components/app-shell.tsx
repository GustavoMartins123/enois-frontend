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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
          <Link to="/feed" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              É<span className="gradient-text">nóis</span>
            </span>
          </Link>

          {authenticated && <SearchBox />}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {authenticated ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label={
                        unreadCount > 0 ? `${unreadCount} notificações não lidas` : "Notificações"
                      }
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl p-0"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">Notificações</p>
                        <p className="text-xs text-muted-foreground">
                          {unreadCount > 0
                            ? `${unreadCount} pendente${unreadCount > 1 ? "s" : ""}`
                            : "Tudo lido por aqui"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => markAllAsRead.mutate()}
                        disabled={unreadCount === 0}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-primary transition hover:bg-primary-soft disabled:pointer-events-none disabled:text-muted-foreground"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Marcar lidas
                      </button>
                    </div>

                    <div className="max-h-[28rem] overflow-y-auto">
                      {notificationList.map((notification) => {
                        const meta =
                          notificationMeta[notification.kind.toLowerCase()] ??
                          notificationMeta.connection;
                        const Icon = meta.icon;

                        return (
                          <div
                            key={notification.id}
                            className={cn(
                              "border-b border-border px-4 py-3 last:border-b-0",
                              notification.read ? "bg-popover" : "bg-primary-soft/40",
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
                                  <p className="text-sm font-semibold leading-tight">
                                    {notification.actorName && (
                                      <span>{notification.actorName} </span>
                                    )}
                                    <span className="font-normal text-muted-foreground">
                                      {notification.title.toLowerCase()}
                                    </span>
                                  </p>
                                  {!notification.read && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                  )}
                                </div>
                                <p className="mt-1 break-words text-sm leading-snug text-muted-foreground">
                                  {notification.body}
                                </p>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(notification.createdAt)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <button
                                        type="button"
                                        onClick={() => markAsRead.mutate(notification.id)}
                                        className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
                                          } catch { }
                                        }}
                                        className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
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
                                        className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
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
                    className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-muted"
                  >
                    <UserAvatar src={profile.avatar} alt={profile.name} className="h-8 w-8" />
                    <span className="hidden text-sm font-medium sm:inline">Perfil</span>
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
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-w-[64px] shrink-0 flex-col items-center gap-0.5 whitespace-nowrap px-2 py-2 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
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
        className="ml-auto grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
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
            <Search className="pointer-events-none absolute left-7 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar pessoas, comunidades, vagas..."
              className="h-12 rounded-full border-border bg-card pl-10 pr-4"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-7 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {open && debounced.length >= 2 && (
              <div className="absolute left-4 right-4 top-full mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
                {items.length === 0 && !isFetching && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
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
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                        >
                          <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </p>
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
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar pessoas, comunidades, vagas..."
          className="h-10 rounded-full border-transparent bg-muted pl-9"
        />
        {isFetching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {open && debounced.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-border bg-popover shadow-lg">
            {items.length === 0 && !isFetching && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
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
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted"
                    >
                      <UserAvatar src={item.image} alt={item.title} className="h-10 w-10" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
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
