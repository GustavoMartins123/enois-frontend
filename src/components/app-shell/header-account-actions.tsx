import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { LogIn } from "lucide-react";

import { profileApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

import { NotificationsPopover } from "./notifications-popover";

type HeaderAccountActionsProps = {
  authenticated: boolean;
};

export function HeaderAccountActions({ authenticated }: HeaderAccountActionsProps) {
  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: () => profileApi.me(),
    enabled: authenticated,
  });

  if (!authenticated) {
    return (
      <Button asChild className="rounded-full gap-1.5" size="sm">
        <Link to="/entrar" search={{ tab: "login" }}>
          <LogIn className="h-4 w-4" /> Entrar
        </Link>
      </Button>
    );
  }

  return (
    <>
      <NotificationsPopover />
      {profile && (
        <Link
          to="/perfil/$username"
          params={{ username: profile.username }}
          className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-surface-2"
        >
          <UserAvatar src={profile.avatar} alt={profile.name} className="h-8 w-8" />
          <span className="hidden text-[13px] font-light text-text-strong sm:inline">Perfil</span>
        </Link>
      )}
    </>
  );
}
