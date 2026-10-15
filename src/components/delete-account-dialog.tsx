import { useState } from "react";

import { texts } from "@/texts";
import type { DeleteAccountDialogProps } from "@/types/components/account/delete-account-dialog-props";

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

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reset = () => {
    setPassword("");
    setConfirmed(false);
    setError(null);
    setDeleting(false);
  };

  const submit = async () => {
    setError(null);
    setDeleting(true);
    try {
      await authApi.deleteAccount({ password });
      clearSession();
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : texts.account.deleteAccount.error);
      setDeleting(false);
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
          <DialogTitle className="text-[18px] font-light text-destructive">
            {texts.account.deleteAccount.title}
          </DialogTitle>

          <DialogDescription>{texts.account.deleteAccount.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-[13px] font-light text-text-subtle">
            {texts.account.deleteAccount.consequences.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="space-y-1.5">
            <Label htmlFor="deletePassword">{texts.account.deleteAccount.password}</Label>

            <Input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={128}
            />
          </div>

          <label className="flex items-start gap-2 text-[13px] font-light text-text-strong">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />

            <>{texts.account.deleteAccount.confirm}</>
          </label>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            variant="destructive"
            className="w-full rounded-full"
            disabled={deleting || !password || !confirmed}
            onClick={submit}
          >
            {deleting ? texts.account.deleteAccount.deleting : texts.account.deleteAccount.action}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
