import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ENABLED_OAUTH_PROVIDERS,
  OAUTH_PROVIDER_LABELS,
  isOAuthProvider,
  isOAuthProviderEnabled,
} from "@/constants/auth-providers";
import { texts } from "@/texts";
import type { OAuthProvider } from "@/types/application/auth/oauth-provider";
import type { LinkedAccountsDialogProps } from "@/types/components/account/linked-accounts-dialog-props";
import { Link2, Link2Off, Loader2 } from "lucide-react";

import { ApiError, authApi, linkedInIntegrationApi } from "@/lib/api";
import { dataHora } from "@/lib/date/format";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

import { LinkedinImportSection } from "@/components/security/linkedin-import-section";

/**
 * Contas vinculadas: mostra o que já está ligado e permite vincular/desvincular.
 *
 * Só oferece vincular os provedores habilitados (ver ENABLED_OAUTH_PROVIDERS), mas continua
 * listando um provedor desativado que a conta já tenha vinculado — senão ficaria impossível
 * desvincular. Vincular começa um OAuth com state de vinculação (o backend só liga a identidade
 * se o pedido tiver partido de uma conta logada). Desvincular é recusado quando seria o último
 * jeito de entrar.
 */
export function LinkedAccountsDialog({ open, onOpenChange }: LinkedAccountsDialogProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["linked-providers"],
    queryFn: () => authApi.oauthProviders(),
    enabled: open,
  });

  const linked = data ?? [];

  const visibleProviders = [
    ...new Set<string>([...ENABLED_OAUTH_PROVIDERS, ...linked.map((item) => item.provider)]),
  ];

  const unlink = useMutation({
    mutationFn: (provider: string) => authApi.oauthUnlink(provider),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["linked-providers"] }),
  });

  const link = useMutation({
    mutationFn: (provider: OAuthProvider) => authApi.oauthLinkStart(provider),
    onSuccess: (start) => {
      // No LinkedIn o vínculo pede w_member_social; ao voltar para o feed, a página pergunta se a
      // pessoa quer sincronizar as publicações (ver LinkedInSyncPrompt).
      if (start.provider === "LINKEDIN") localStorage.setItem("linkedin_link_pending", "1");
      window.location.href = start.authorizationUrl;
    },
  });

  const linkedinLinked = linked.some((item) => item.provider === "LINKEDIN");
  const { data: linkedinStatus } = useQuery({
    queryKey: ["linkedin-integration"],
    queryFn: () => linkedInIntegrationApi.status(),
    enabled: open && linkedinLinked,
  });
  const { toast } = useToast();
  const setSync = useMutation({
    mutationFn: (enabled: boolean) => linkedInIntegrationApi.setPostSync(enabled),
    onSuccess: (status) => {
      queryClient.setQueryData(["linkedin-integration"], status);
      toast(texts.auth.links.linkedinSync.saved);
    },
    onError: () => toast(texts.auth.links.linkedinSync.unavailable, "error"),
  });

  // Cada ação tem a sua mensagem: dizer "não foi possível desvincular" quando o clique foi em
  // "Vincular" manda a pessoa procurar um vínculo que não existe (era o que acontecia aqui).
  const unlinkMessage =
    unlink.error instanceof ApiError && unlink.error.code === "LAST_LOGIN_METHOD"
      ? texts.auth.links.lastMethod
      : unlink.error
        ? texts.auth.links.unlinkError
        : null;

  const linkMessage = link.error
    ? link.error instanceof ApiError && link.error.code === "OAUTH_NOT_CONFIGURED"
      ? texts.auth.links.notConfigured(
          link.variables
            ? OAUTH_PROVIDER_LABELS[link.variables]
            : texts.auth.links.providerFallback,
        )
      : texts.auth.links.linkError
    : null;

  const errorMessage = unlinkMessage ?? linkMessage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-normal">{texts.auth.links.title}</DialogTitle>

          <DialogDescription>{texts.auth.links.description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-2 pt-2">
            {visibleProviders.map((provider) => {
              const current = linked.find((item) => item.provider === provider);
              const linkable = isOAuthProviderEnabled(provider) ? provider : null;
              const label = isOAuthProvider(provider) ? OAUTH_PROVIDER_LABELS[provider] : provider;
              const busy = unlink.isPending || link.isPending;

              return (
                <li
                  key={provider}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border-soft px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-strong">{label}</p>

                    <p className="truncate text-xs font-normal text-text-subtle">
                      {current
                        ? current.email || texts.auth.links.linked
                        : texts.auth.links.notLinked}
                    </p>
                  </div>

                  {current ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full gap-1.5"
                      disabled={busy}
                      onClick={() => unlink.mutate(provider)}
                    >
                      <Link2Off className="h-3.5 w-3.5" />

                      <>{texts.auth.links.unlink}</>
                    </Button>
                  ) : (
                    linkable && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 rounded-full gap-1.5"
                        disabled={busy}
                        onClick={() => link.mutate(linkable)}
                      >
                        <Link2 className="h-3.5 w-3.5" />

                        <>{texts.auth.links.link(label)}</>
                      </Button>
                    )
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

        {linkedinLinked && linkedinStatus && (
          <div className="mt-2 rounded-xl border border-border-soft px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-strong">
                  {texts.auth.links.linkedinSync.toggle}
                </p>

                <p className="text-xs font-normal text-text-subtle">
                  {texts.auth.links.linkedinSync.toggleHint}
                </p>
              </div>

              <Switch
                checked={linkedinStatus.postSync}
                disabled={setSync.isPending || !linkedinStatus.canPost}
                onCheckedChange={(checked) => setSync.mutate(checked)}
              />
            </div>

            {/* O share falha em silêncio de propósito; o resultado da última tentativa é o que
                deixa a pessoa diagnosticar sem suporte (relato: "ativei, publiquei e não foi"). */}
            {linkedinStatus.lastShareStatus && (
              <p className="mt-2 text-xs font-normal text-text-subtle">
                {linkedinStatus.lastShareStatus === "OK"
                  ? texts.auth.links.linkedinSync.lastShareOk
                  : texts.auth.links.linkedinSync.lastShareFailed(linkedinStatus.lastShareStatus)}
                {linkedinStatus.lastShareAt ? dataHora(linkedinStatus.lastShareAt) : null}
              </p>
            )}

            {!linkedinStatus.canPost && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs font-normal text-text-subtle">
                  {linkedinStatus.reason === "SERVER_KEY_MISSING"
                    ? texts.auth.links.linkedinSync.serverKey
                    : texts.auth.links.linkedinSync.notReady}
                </p>
                {linkedinStatus.reason !== "SERVER_KEY_MISSING" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-auto shrink-0 rounded-full"
                    disabled={link.isPending}
                    onClick={() => link.mutate("LINKEDIN")}
                  >
                    {texts.auth.links.linkedinSync.reconnect}
                  </Button>
                )}
                {linkedinStatus.reason !== "SERVER_KEY_MISSING" && (
                  <p className="mt-1 basis-full text-xs text-text-subtle">
                    {texts.auth.links.linkedinSync.reconnectHint}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* A importação mora AQUI: conectou o LinkedIn, o próximo passo natural está na mesma tela.
            O import lê o ARQUIVO DE DADOS do LinkedIn (o mesmo caminho sancionado — sem scraping e
            sem depender da aprovação de parceiro): a pessoa escolhe o que quer trazer. */}
        <div className="mt-3">
          <LinkedinImportSection
            linkedinConectado={linked.some((item) => item.provider === "LINKEDIN")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
