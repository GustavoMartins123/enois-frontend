import { useState } from "react";

import { texts } from "@/texts";
import type { ChangePasswordDialogProps } from "@/types/components/account/change-password-dialog-props";
import { Eye, EyeOff } from "lucide-react";

import { ApiError, authApi, clearSession } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_LENGTH = 8;

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSaving(false);
  };

  const submit = async () => {
    if (newPassword.length < MIN_LENGTH) {
      setError(texts.account.changePassword.tooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(texts.account.changePassword.mismatch);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      // O backend revoga todas as sessoes ao trocar a senha: e preciso entrar de novo.
      clearSession();
      window.location.href = "/entrar?tab=login";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : texts.account.changePassword.error);
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-light text-text-strong">
            {texts.account.changePassword.title}
          </DialogTitle>

          <DialogDescription>{texts.account.changePassword.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">{texts.account.changePassword.current}</Label>

            <Input
              id="currentPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              maxLength={128}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">{texts.account.changePassword.newPassword}</Label>

            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                maxLength={128}
              />

              <button
                type="button"
                onClick={() => setShowPasswords((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                aria-label={showPasswords ? texts.auth.password.hide : texts.auth.password.show}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{texts.account.changePassword.confirm}</Label>

            <Input
              id="confirmPassword"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              maxLength={128}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            className="w-full rounded-full"
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            onClick={submit}
          >
            {saving ? texts.account.changePassword.saving : texts.account.changePassword.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
