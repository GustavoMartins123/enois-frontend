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
} from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentUser } from "@/lib/mock-data";
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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
            <button className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
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
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
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
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
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
