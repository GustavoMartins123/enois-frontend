import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute, useMatchRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import { ArrowLeft, Gavel, ShieldAlert } from "lucide-react";

import { sanctionsApi, walletApi } from "@/lib/api";
import { formatFaisca } from "@/lib/faisca";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

/**
 * Fila de recursos das penalidades automaticas. Somente administradores (REDE_ADMIN_EMAILS)
 * conseguem de fato decidir — para os demais a API devolve 403 e a pagina avisa.
 */
export const Route = createFileRoute("/moderacao")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.sanctions.moderationTitle }] }),
  component: Moderacao,
});

function Moderacao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const matchRoute = useMatchRoute();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pending-appeals"],
    queryFn: () => sanctionsApi.pendingAppeals(),
    retry: false,
    // A decisão de um recurso é filha desta fila: quando é ela que está na tela, a fila não precisa
    // ser buscada (e o roteador só renderiza o filho se a fila devolver o Outlet).
    enabled: !matchRoute({ to: "/moderacao/$reportId" }),
  });

  const decide = useMutation({
    mutationFn: ({ appealId, deny }: { appealId: string; deny: boolean }) =>
      deny ? sanctionsApi.denyAppeal(appealId) : sanctionsApi.approveAppeal(appealId),
    onSuccess: () => {
      toast(texts.sanctions.decided, "success");
      void queryClient.invalidateQueries({ queryKey: ["pending-appeals"] });
    },
    onError: () => toast(texts.sanctions.moderationError, "error"),
  });

  // Sem devolver o filho aqui, o roteador renderiza a fila no lugar da tela de decisão (a mesma
  // armadilha do Outlet que derrubava o post do blog).
  if (matchRoute({ to: "/moderacao/$reportId" })) {
    return <Outlet />;
  }

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.sanctions.back}</>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {texts.sanctions.moderationTitle}
          </h1>

          <p className="text-sm text-muted-foreground">{texts.sanctions.moderationDescription}</p>
        </div>

        <DisputasSection />

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <div className="rounded-2xl border border-border-soft bg-surface-card p-6 text-sm text-text-subtle">
            {texts.sanctions.moderationError}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface-card">
            <EmptyState icon={Gavel} title={texts.sanctions.moderationEmpty} />
          </div>
        ) : (
          <ul className="space-y-3">
            {data!.map((item) => (
              <li
                key={item.id}
                className="space-y-2 rounded-2xl border border-border-soft bg-surface-card p-4"
              >
                <p className="text-sm">{item.message}</p>

                <p className="text-xs text-text-subtle">
                  {new Date(item.createdAt).toLocaleString("pt-BR")}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ appealId: item.id, deny: false })}
                  >
                    {texts.sanctions.approve}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-full"
                    disabled={decide.isPending}
                    onClick={() => decide.mutate({ appealId: item.id, deny: true })}
                  >
                    {texts.sanctions.deny}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

/**
 * As contestações de transferência (golpe) na fila de moderação: VERDADEIRA reverte a
 * transferência e restringe o golpista; FALSA restringe quem contestou de má-fé.
 * Somente administradores — para os demais a API devolve 403 e a seção nem aparece.
 */
function DisputasSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: disputas, error, isLoading } = useQuery({
    queryKey: ["coin-disputas"],
    queryFn: () => walletApi.disputasPendentes(30),
    retry: false,
  });

  const decidir = useMutation({
    mutationFn: ({ id, deferir, note }: { id: string; deferir: boolean; note?: string }) =>
      deferir ? walletApi.deferirDisputa(id, note) : walletApi.rejeitarDisputa(id, note),
    onSuccess: (resposta) => {
      toast(
        resposta.state === "UPHELD"
          ? "Contestação deferida: a transferência foi revertida e o valor voltou para a vítima."
          : "Contestação rejeitada: quem contestou foi restringido.",
        "success",
      );
      void queryClient.invalidateQueries({ queryKey: ["coin-disputas"] });
    },
    onError: () => toast("Não foi possível decidir a contestação.", "error"),
  });

  // 403 = não é admin: a seção não existe para quem não decide.
  if (error) return null;

  return (
    <section className="space-y-3" aria-label="Contestações de transferência">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
          Contestações de transferência
        </h2>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (disputas?.length ?? 0) === 0 ? (
        <p className="rounded-2xl border border-border-soft bg-surface-card p-4 text-sm text-text-subtle">
          Nenhuma contestação esperando decisão.
        </p>
      ) : (
        <ul className="space-y-3">
          {disputas!.map((d) => (
            <li key={d.id} className="space-y-2 rounded-2xl border border-border-soft bg-surface-card p-4">
              <p className="text-sm font-semibold">
                Transferência de {formatFaisca(d.amount)} faíscas · motivo: {d.reason}
              </p>
              <p className="text-xs text-text-subtle">
                {new Date(d.createdAt).toLocaleString("pt-BR")} · ref {d.entryRef.slice(0, 16)}…
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  className="rounded-full"
                  disabled={decidir.isPending}
                  onClick={() => decidir.mutate({ id: d.id, deferir: true })}
                >
                  Procede (reverter)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  disabled={decidir.isPending}
                  onClick={() => decidir.mutate({ id: d.id, deferir: false })}
                >
                  Não procede (punir contestador)
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
