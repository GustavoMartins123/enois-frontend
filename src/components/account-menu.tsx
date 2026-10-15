import { useState } from "react";

import { Link } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { AccountMenuProps } from "@/types/components/account/account-menu-props";
import { KeyRound, LifeBuoy, Link2, LogOut, Mail, ShieldCheck, ShieldOff, Trash2, User } from "lucide-react";

import { logout } from "@/lib/logout";
import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ChangeEmailDialog } from "./change-email-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { LinkedAccountsDialog } from "./linked-accounts-dialog";
import { PushToggle } from "./push-toggle";
import { UserAvatar } from "./user-avatar";

const ITEM_CLASS =
  "flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-light text-text-strong transition hover:bg-surface-2 disabled:opacity-50";

export function AccountMenu({ profile }: AccountMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openChangeEmail = () => {
    setMenuOpen(false);
    setShowChangeEmail(true);
  };

  const openChangePassword = () => {
    setMenuOpen(false);
    setShowChangePassword(true);
  };

  const openLinkedAccounts = () => {
    setMenuOpen(false);
    setShowLinkedAccounts(true);
  };

  const openDeleteAccount = () => {
    setMenuOpen(false);
    setShowDeleteAccount(true);
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

            <Link to="/suporte" onClick={() => setMenuOpen(false)} className={ITEM_CLASS}>
              <LifeBuoy className="h-4 w-4" />

              <>{texts.account.menu.support}</>
            </Link>

            <Link to="/seguranca" onClick={() => setMenuOpen(false)} className={ITEM_CLASS}>
              <ShieldCheck className="h-4 w-4" />

              <>{texts.account.menu.security}</>
            </Link>

            <Link to="/bloqueados" onClick={() => setMenuOpen(false)} className={ITEM_CLASS}>
              <ShieldOff className="h-4 w-4" />

              <>{texts.account.menu.blockedUsers}</>
            </Link>

            <button type="button" onClick={openChangePassword} className={ITEM_CLASS}>
              <KeyRound className="h-4 w-4" />

              <>{texts.account.menu.changePassword}</>
            </button>

            <button type="button" onClick={openLinkedAccounts} className={ITEM_CLASS}>
              <Link2 className="h-4 w-4" />

              <>{texts.account.menu.linkedAccounts}</>
            </button>

            <PushToggle onClose={() => setMenuOpen(false)} />
          </div>

          <div className="border-t border-border-soft py-1">
            <button
              type="button"
              onClick={openDeleteAccount}
              className={cn(ITEM_CLASS, "text-destructive hover:text-destructive")}
            >
              <Trash2 className="h-4 w-4" />

              <>{texts.account.menu.deleteAccount}</>
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
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      <DeleteAccountDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />

      <LinkedAccountsDialog open={showLinkedAccounts} onOpenChange={setShowLinkedAccounts} />
    </>
  );
}
