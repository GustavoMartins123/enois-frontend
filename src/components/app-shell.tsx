import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Users,
  MessageCircle,
  Briefcase,
  GraduationCap,
  Calendar,
  Bell,
  Search,
  Sparkles,
  Compass,
  CheckCheck,
  AtSign,
  UserPlus,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentUser, findUser, notifications, type Notification } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/feed", label: "Início", icon: Home },
  { to: "/rede", label: "Rede", icon: Users },
  { to: "/comunidades", label: "Comunidades", icon: Compass },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/mentoria", label: "Mentoria", icon: GraduationCap },
  { to: "/eventos", label: "Eventos", icon: Calendar },
];

const notificationMeta: Record<
  Notification["kind"],
  { icon: React.ElementType; className: string }
> = {
  connection: { icon: UserPlus, className: "bg-primary-soft text-primary" },
  message: { icon: MessageCircle, className: "bg-secondary/30 text-secondary-foreground" },
  mention: { icon: AtSign, className: "bg-accent text-accent-foreground" },
  event: { icon: Calendar, className: "bg-growth/15 text-growth" },
  job: { icon: Briefcase, className: "bg-opportunity/20 text-opportunity-foreground" },
  mentoring: { icon: GraduationCap, className: "bg-primary-soft text-primary" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [notificationList, setNotificationList] = useState(notifications);
  const unreadCount = useMemo(
    () => notificationList.filter((notification) => !notification.read).length,
    [notificationList],
  );

  const markNotificationAsRead = (id: string) => {
    setNotificationList((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotificationList((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/feed" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Conex<span className="gradient-text">ão</span>
            </span>
          </Link>

          <div className="relative ml-2 hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pessoas, comunidades, vagas..."
              className="h-10 rounded-full border-transparent bg-muted pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
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
                    onClick={markAllNotificationsAsRead}
                    disabled={unreadCount === 0}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-primary transition hover:bg-primary-soft disabled:pointer-events-none disabled:text-muted-foreground"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar lidas
                  </button>
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  {notificationList.map((notification) => {
                    const meta = notificationMeta[notification.kind];
                    const Icon = meta.icon;
                    const actor = notification.actorId ? findUser(notification.actorId) : null;

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "border-b border-border px-4 py-3 last:border-b-0",
                          notification.read ? "bg-popover" : "bg-primary-soft/40",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                              meta.className,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold leading-tight">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>
                            {actor && (
                              <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                                {actor.name}
                              </p>
                            )}
                            <p className="mt-1 text-sm leading-snug text-muted-foreground">
                              {notification.body}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.createdAt}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <button
                                    type="button"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                    className="rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  >
                                    Lida
                                  </button>
                                )}
                                <Link
                                  to={notification.href}
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                                >
                                  {notification.ctaLabel}
                                </Link>
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
            <Link
              to="/perfil/$username"
              params={{ username: currentUser.username }}
              className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-muted"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Perfil</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
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

          <div className="mt-6 surface-card p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sua reputação
            </p>
            <div className="mt-3 space-y-2">
              {currentUser.reputation.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="text-xs text-muted-foreground">Nível {r.level}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2">
          {nav.slice(0, 5).map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-medium",
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
    </div>
  );
}
