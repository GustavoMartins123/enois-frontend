import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { LinkedAccountsDialogProps } from "@/types/components/account/linked-accounts-dialog-props";
import { Loader2, Link2, Link2Off } from "lucide-react";

import { ApiError, authApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROVIDERS = [
  { id: "GOOGLE", label: "Google" },
  { id: "APPLE", label: "Apple" },
] as const;

/**
 * Contas vinculadas: mostra o que já está ligado e permite vincular/desvincular.
 *
 * Vincular começa um OAuth com state de vinculação (o backend só liga a identidade se o pedido tiver
 * partido de uma conta logada). Desvincular é recusado quando seria o último jeito de entrar.
 */
export function LinkedAccountsDialog({ open, onOpenChange }: LinkedAccountsDialogProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["linked-providers"],
    queryFn: () => authApi.oauthProviders(),
    enabled: open,
  });

  const linked = data ?? [];

  const unlink = useMutation({
    mutationFn: (provider: string) => authApi.oauthUnlink(provider),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["linked-providers"] }),
  });

  const link = useMutation({
    mutationFn: (provider: "GOOGLE" | "APPLE") => authApi.oauthLinkStart(provider),
    onSuccess: (start) => {
      window.location.href = start.authorizationUrl;
    },
  });

  const error = unlink.error ?? link.error;
  const errorMessage =
    error instanceof ApiError && error.code === "LAST_LOGIN_METHOD"
      ? texts.auth.links.lastMethod
      : error
        ? texts.auth.links.unlinkError
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.auth.links.title}</DialogTitle>

          <DialogDescription>{texts.auth.links.description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-2 pt-2">
            {PROVIDERS.map((provider) => {
              const current = linked.find((item) => item.provider === provider.id);
              const busy = unlink.isPending || link.isPending;

              return (
                <li
                  key={provider.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-soft px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-text-strong">{provider.label}</p>

                    <p className="truncate text-[11px] font-light text-text-subtle">
                      {current ? current.email || texts.auth.links.linked : texts.auth.links.notLinked}
                    </p>
                  </div>

                  {current ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full gap-1.5"
                      disabled={busy}
                      onClick={() => unlink.mutate(provider.id)}
                    >
                      <Link2Off className="h-3.5 w-3.5" />

                      <>{texts.auth.links.unlink}</>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full gap-1.5"
                      disabled={busy}
                      onClick={() => link.mutate(provider.id)}
                    >
                      <Link2 className="h-3.5 w-3.5" />

                      <>{texts.auth.links.link(provider.label)}</>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {errorMessage && (
          <p className="mt-2 rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
