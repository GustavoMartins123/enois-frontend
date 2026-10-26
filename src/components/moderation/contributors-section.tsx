import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ContributorAdminView } from "@/types/application/contributors/contributor-admin-view";
import type { ContributorApplicationStatus } from "@/types/application/contributors/contributor-application-status";
import { Mail, RefreshCw, UserPlus } from "lucide-react";

import { contributorsApi } from "@/lib/api";
import { dataCurta, dataHora } from "@/lib/date/format";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { GithubIcon } from "@/components/icons/github";
import { ListRowSkeletons } from "@/components/skeletons/list-row-skeletons";

/**
 * Fila de quem se ofereceu para contribuir, no mesmo formato da fila de candidaturas do painel:
 * card com os dados rotulados e ações claras (análise -> aprovação/recusa), em vez de um seletor
 * cru de status. Estados finais (aprovada/recusada) mostram só o selo.
 */
export function ContributorsSection() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["moderator", "contributors"],
    queryFn: () => contributorsApi.adminList(),
    retry: false,
  });

  const rows = data ?? [];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
            {texts.moderator.contributors.title}
          </h2>

          <p className="text-sm text-muted-foreground">
            {texts.moderator.contributors.description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          aria-label={texts.moderator.contributors.refresh}
          title={texts.moderator.contributors.refresh}
          onClick={() => void refetch()}
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <ListRowSkeletons />
      ) : isError ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {texts.moderator.contributors.error}
        </p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-surface-card p-6 text-center text-sm text-text-subtle">
          <UserPlus className="mx-auto mb-2 h-6 w-6 text-primary" />

          <>{texts.moderator.contributors.empty}</>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((application) => (
            <ContributorCard key={application.id} application={application} />
          ))}
        </ul>
      )}
    </section>
  );
}

const STATUS_BADGE: Record<ContributorApplicationStatus, string> = {
  NEW: "bg-primary-soft text-primary-text",
  REVIEWING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-growth/10 text-growth",
  REJECTED: "bg-destructive/10 text-destructive",
};

function ContributorCard({ application }: { application: ContributorAdminView }) {
  const queryClient = useQueryClient();

  const setStatus = useMutation({
    mutationFn: (status: ContributorApplicationStatus) =>
      contributorsApi.adminUpdateStatus(application.id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["moderator", "contributors"] });
    },
  });

  const status = application.status;
  const decidida = status === "APPROVED" || status === "REJECTED";

  return (
    <li className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-strong">{application.name}</p>

          <p className="text-xs text-text-subtle">{dataHora(application.createdAt)}</p>
        </div>

        <span
          className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[status])}
        >
          {texts.moderator.contributors.status[status]}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
          {texts.moderator.contributors.contact}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <a
            href={`https://github.com/${application.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <GithubIcon className="h-3.5 w-3.5" />@{application.github}
          </a>

          <a
            href={`mailto:${application.email}`}
            className="inline-flex items-center gap-1 text-text-subtle hover:text-primary"
          >
            <Mail className="h-3.5 w-3.5" />
            {application.email}
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {application.area && (
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-text">
            {texts.moderator.contributors.area}: {application.area}
          </span>
        )}

        {application.experience && (
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-text-subtle">
            {texts.moderator.contributors.experience}: {application.experience}
          </span>
        )}

        <span className="text-text-subtle">
          {texts.moderator.contributors.acceptedAt}: {dataCurta(application.acceptedTermsAt)}
        </span>
      </div>

      {application.message && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            {texts.moderator.contributors.title}
          </p>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-strong">
            {application.message}
          </p>
        </div>
      )}

      {!decidida ? (
        <div className="flex flex-wrap gap-2">
          {status === "NEW" && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate("REVIEWING")}
            >
              {texts.moderator.contributors.review}
            </Button>
          )}

          <Button
            size="sm"
            className="rounded-full"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate("APPROVED")}
          >
            {texts.moderator.contributors.approve}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            className="rounded-full"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate("REJECTED")}
          >
            {texts.moderator.contributors.reject}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-text-subtle">{texts.moderator.contributors.done}</p>
      )}

      {setStatus.isError && (
        <p className="text-xs text-destructive">{texts.moderator.contributors.saveError}</p>
      )}
    </li>
  );
}
