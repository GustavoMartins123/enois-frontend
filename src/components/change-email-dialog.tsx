import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ChangeEmailDialogProps } from "@/types/components/account/change-email-dialog-props";

import { ApiError, authApi } from "@/lib/api";

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ChangeEmailDialog({ open, onOpenChange, currentEmail }: ChangeEmailDialogProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const change = useMutation({
    mutationFn: () => authApi.changeEmail({ email: email.trim(), password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setDone(true);
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : texts.account.changeEmail.error),
  });

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setDone(false);
  };

  const normalized = email.trim().toLowerCase();
  const invalidEmail = normalized !== "" && !EMAIL_PATTERN.test(normalized);
  const sameEmail = normalized === currentEmail.trim().toLowerCase();
  const canSubmit = normalized !== "" && !invalidEmail && !sameEmail && password !== "";

  const submit = () => {
    setError(null);
    if (invalidEmail) return setError(texts.account.changeEmail.invalidEmail);
    if (sameEmail) return setError(texts.account.changeEmail.sameEmail);
    change.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.account.changeEmail.title}</DialogTitle>

          <DialogDescription>{texts.account.changeEmail.description}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{texts.account.changeEmail.success}</p>

            <Button className="w-full rounded-full" onClick={() => onOpenChange(false)}>
              {texts.common.close}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              {texts.account.changeEmail.current(currentEmail)}
            </p>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.account.changeEmail.newEmail}
              </Label>

              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={texts.account.changeEmail.newEmailPlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.account.changeEmail.password}
              </Label>

              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted"
              />

              <p className="text-xs text-muted-foreground">
                {texts.account.changeEmail.passwordHint}
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              className="w-full rounded-full"
              disabled={!canSubmit || change.isPending}
              onClick={submit}
            >
              {change.isPending ? texts.common.saving : texts.account.changeEmail.action}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
