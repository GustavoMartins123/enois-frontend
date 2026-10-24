import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { ContributorApplicationStatus } from "@/types/application/contributors/contributor-application-status";
import { Mail, RefreshCw, UserPlus } from "lucide-react";

import { contributorsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { GithubIcon } from "@/components/icons/github";
import { ListRowSkeletons } from "@/components/skeletons/list-row-skeletons";

const STATUSES: ContributorApplicationStatus[] = ["NEW", "REVIEWING", "APPROVED", "REJECTED"];

/**
 * Fila interna de quem se ofereceu para contribuir. O formulário da landing é público; esta tela
 * é a documentação do time: contato, área, experiência, mensagem e o aceite dos termos.
 */
export function ContributorsSection() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["moderator", "contributors"],
    queryFn: () => contributorsApi.adminList(),
    retry: false,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContributorApplicationStatus }) =>
      contributorsApi.adminUpdateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["moderator", "contributors"] });
    },
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
        <ul className="space-y-2">
          {rows.map((application) => (
            <li
              key={application.id}
              className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-strong">{application.name}</p>

                  <a
                    href={`https://github.com/${application.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />@{application.github}
                  </a>
                </div>

                <label className="flex items-center gap-2 text-xs text-text-subtle">
                  {texts.moderator.contributors.statusLabel}

                  <select
                    value={application.status}
                    disabled={updateStatus.isPending}
                    onChange={(event) =>
                      updateStatus.mutate({
                        id: application.id,
                        status: event.target.value as ContributorApplicationStatus,
                      })
                    }
                    className="h-8 rounded-lg border border-border-soft bg-surface-1 px-2 text-xs text-text-strong"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {texts.moderator.contributors.status[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                <a
                  href={`mailto:${application.email}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {application.email}
                </a>

                {application.area && (
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-text">
                    {texts.moderator.contributors.area}: {application.area}
                  </span>
                )}

                {application.experience && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">
                    {texts.moderator.contributors.experience}: {application.experience}
                  </span>
                )}

                <span>
                  {texts.moderator.contributors.acceptedAt}:{" "}
                  {new Date(application.acceptedTermsAt).toLocaleString("pt-BR")}
                </span>
              </div>

              {application.message && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {application.message}
                </p>
              )}

              <p className="text-[11px] text-text-subtle">
                {new Date(application.createdAt).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {updateStatus.isError && (
        <p className="text-xs text-destructive">{texts.moderator.contributors.saveError}</p>
      )}
    </section>
  );
}
