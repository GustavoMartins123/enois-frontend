import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ChangePasswordDialogProps } from "@/types/components/account/change-password-dialog-props";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  PasswordInput,
} from "@rede-enois/design-system/ui";
import { Loader2 } from "lucide-react";

import { ApiError, authApi, clearSession } from "@/lib/api";

const MIN_LENGTH = 8;

/**
 * Troca de senha — e, para quem entrou por login social, a CRIAÇÃO da primeira.
 *
 * Quem veio do Google/LinkedIn nunca definiu senha: a conta nasce com um hash aleatório que
 * ninguém conhece. Para essas contas o diálogo não pede a senha atual (não existe), e sim cria a
 * primeira — sem isso a pessoa ficava presa: o segundo fator manda "defina uma senha" e a troca
 * pedia uma senha que nunca existiu.
 */
export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // O dado já está em cache no app (/auth/me). Sem ele (falha de rede), vale o comportamento
  // antigo: pedir a senha atual. Nunca esconder o campo de quem tem senha.
  const { data: authUser, isPending } = useQuery({
    queryKey: ["auth-me"],
    queryFn: () => authApi.me(),
    enabled: open,
  });
  const hasPassword = authUser?.hasPassword ?? true;

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
      await authApi.changePassword({
        currentPassword: hasPassword ? currentPassword : "",
        newPassword,
      });
      // O backend revoga todas as sessoes ao trocar a senha: e preciso entrar de novo.
      clearSession();
      window.location.href = "/entrar?tab=login";
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : hasPassword
            ? texts.account.changePassword.error
            : texts.account.changePassword.errorCreate,
      );
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
          <DialogTitle className="text-lg font-normal text-text-strong">
            {hasPassword
              ? texts.account.changePassword.title
              : texts.account.changePassword.titleCreate}
          </DialogTitle>

          <DialogDescription>
            {hasPassword
              ? texts.account.changePassword.description
              : texts.account.changePassword.descriptionCreate}
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {hasPassword && (
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
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{texts.account.changePassword.newPassword}</Label>

              <PasswordInput
                id="newPassword"
                revealed={showPasswords}
                onToggle={() => setShowPasswords((value) => !value)}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                maxLength={128}
              />
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
              disabled={
                saving || !newPassword || !confirmPassword || (hasPassword && !currentPassword)
              }
              onClick={submit}
            >
              {saving
                ? texts.account.changePassword.saving
                : hasPassword
                  ? texts.account.changePassword.action
                  : texts.account.changePassword.actionCreate}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
