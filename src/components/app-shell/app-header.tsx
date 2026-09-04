import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { LogIn, Menu, Sparkles } from "lucide-react";

import { profileApi } from "@/lib/api";

import { Button } from "@/components/ui/button";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";

import { NotificationsPopover } from "./notifications-popover";
import { SearchBox } from "./search-box";

type AppHeaderProps = {
  authenticated: boolean;
  onOpenMobileMenu: () => void;
};

export function AppHeader({ authenticated, onOpenMobileMenu }: AppHeaderProps) {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: () => profileApi.me(),
    enabled: authenticated,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-surface-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        {authenticated && (
          <button
            onClick={onOpenMobileMenu}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-text-subtle transition hover:bg-surface-2 hover:text-primary md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to="/feed" className="flex shrink-0 items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground sm:h-9 sm:w-9"
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
              <NotificationsPopover />
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
  );
}
