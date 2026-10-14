import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { AccountMenuProps } from "@/types/components/account/account-menu-props";
import { KeyRound, LogOut, Mail, User } from "lucide-react";

import { logout } from "@/lib/logout";
import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ChangeEmailDialog } from "./change-email-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { UserAvatar } from "./user-avatar";

const ITEM_CLASS =
  "flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-light text-text-strong transition hover:bg-surface-2 disabled:opacity-50";

export function AccountMenu({ profile }: AccountMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openChangeEmail = () => {
    setMenuOpen(false);
    setShowChangeEmail(true);
  };

  const openResetPassword = () => {
    setMenuOpen(false);
    setShowResetPassword(true);
  };

  const handleLogout = () => {
    setLoggingOut(true);
    void logout();
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-surface-2"
            aria-label={texts.account.menu.trigger}
          >
            <UserAvatar src={profile.avatar} alt={profile.name} className="h-8 w-8" />

            <span className="hidden text-[13px] font-light text-text-strong sm:inline">
              {texts.common.profile}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[min(calc(100vw-2rem),17rem)] overflow-hidden rounded-2xl border-border-soft bg-surface-card p-0 shadow-card"
        >
          <div className="flex items-center gap-3 border-b border-border-soft px-4 py-3">
            <UserAvatar src={profile.avatar} alt={profile.name} className="h-9 w-9" />

            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-text-strong">{profile.name}</p>

              <p className="truncate text-[11px] text-text-subtle">{profile.email}</p>
            </div>
          </div>

          <div className="py-1">
            <Link
              to="/perfil/$username"
              params={{ username: profile.username }}
              onClick={() => setMenuOpen(false)}
              className={ITEM_CLASS}
            >
              <User className="h-4 w-4" />

              <>{texts.account.menu.profile}</>
            </Link>

            <button type="button" onClick={openChangeEmail} className={ITEM_CLASS}>
              <Mail className="h-4 w-4" />

              <>{texts.account.menu.changeEmail}</>
            </button>

            <button type="button" onClick={openResetPassword} className={ITEM_CLASS}>
              <KeyRound className="h-4 w-4" />

              <>{texts.account.menu.resetPassword}</>
            </button>
          </div>

          <div className="border-t border-border-soft py-1">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(ITEM_CLASS, "text-destructive hover:text-destructive")}
            >
              <LogOut className="h-4 w-4" />

              <>{loggingOut ? texts.account.menu.loggingOut : texts.account.menu.logout}</>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <ChangeEmailDialog
        open={showChangeEmail}
        onOpenChange={setShowChangeEmail}
        currentEmail={profile.email}
      />
      <ResetPasswordDialog
        open={showResetPassword}
        onOpenChange={setShowResetPassword}
        email={profile.email}
      />
    </>
  );
}
