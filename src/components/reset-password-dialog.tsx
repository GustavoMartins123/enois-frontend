import { useMutation } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ResetPasswordDialogProps } from "@/types/components/account/reset-password-dialog-props";
import { MailCheck } from "lucide-react";

import { authApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ResetPasswordDialog({ open, onOpenChange, email }: ResetPasswordDialogProps) {
  const request = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
  });

  const sent = request.isSuccess;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) request.reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.account.resetPassword.title}</DialogTitle>

          <DialogDescription>{texts.account.resetPassword.description(email)}</DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium text-foreground">
                  {texts.account.resetPassword.sentTitle}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {texts.account.resetPassword.sentDescription(email)}
                </p>
              </div>
            </div>

            <Button className="w-full rounded-full" onClick={() => onOpenChange(false)}>
              {texts.account.resetPassword.understood}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {request.isError && (
              <p className="text-sm text-destructive" role="alert">
                {texts.account.resetPassword.error}
              </p>
            )}

            <Button
              className="w-full rounded-full"
              disabled={request.isPending}
              onClick={() => request.mutate()}
            >
              {request.isPending
                ? texts.account.resetPassword.sending
                : texts.account.resetPassword.action}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
