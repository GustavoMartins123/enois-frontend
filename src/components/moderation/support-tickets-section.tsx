import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { SupportCategory } from "@/types/application/support/support-category";
import type { SupportStatus } from "@/types/application/support/support-status";
import { LifeBuoy } from "lucide-react";

import { supportApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";

const CATEGORIES: SupportCategory[] = ["BUG", "ACCOUNT", "CONTENT", "IDEA", "OTHER"];

const STATUS_FILTERS: { id: SupportStatus | "ALL"; label: string }[] = [
  { id: "ALL", label: texts.moderator.support.statusAll },
  { id: "OPEN", label: texts.moderator.support.statusOpen },
  { id: "IN_PROGRESS", label: texts.moderator.support.statusInProgress },
  { id: "CLOSED", label: texts.moderator.support.statusClosed },
];

/**
 * Tickets de suporte do painel central. A aba "Issues" usa o mesmo componente com `lockedCategory`
 * em BUG: é a mesma fila, só enxergada pela categoria de problema.
 */
export function SupportTicketsSection({ lockedCategory }: { lockedCategory?: SupportCategory }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [category, setCategory] = useState<SupportCategory | undefined>(lockedCategory);
  const [status, setStatus] = useState<SupportStatus | "ALL">("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["moderator", "support", category ?? "all", status],
    queryFn: () =>
      supportApi.adminList({
        category,
        status: status === "ALL" ? undefined : status,
        limit: 100,
      }),
    retry: false,
  });

  const move = useMutation({
    mutationFn: ({ id, next }: { id: string; next: SupportStatus }) =>
      supportApi.adminUpdate(id, { status: next }),
    onSuccess: () => {
      toast(texts.moderator.support.moved, "success");
      void queryClient.invalidateQueries({ queryKey: ["moderator", "support"] });
    },
    onError: () => toast(texts.moderator.support.error, "error"),
  });

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
          {lockedCategory ? texts.moderator.support.issuesTitle : texts.moderator.support.title}
        </h2>

        <p className="text-sm text-muted-foreground">{texts.moderator.support.description}</p>
      </div>

      <div className="space-y-2">
        {!lockedCategory && (
          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={category === undefined}
              onClick={() => setCategory(undefined)}
              label={texts.moderator.support.all}
            />

            {CATEGORIES.map((value) => (
              <FilterChip
                key={value}
                active={category === value}
                onClick={() => setCategory(value)}
                label={texts.support.categories[value]}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((item) => (
            <FilterChip
              key={item.id}
              active={status === item.id}
              onClick={() => setStatus(item.id)}
              label={item.label}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-surface-card p-6 text-center text-sm text-text-subtle">
          <LifeBuoy className="mx-auto mb-2 h-6 w-6 text-primary" />

          <>{texts.moderator.support.empty}</>
        </div>
      ) : (
        <ul className="space-y-3">
          {data!.map((ticket) => (
            <li
              key={ticket.id}
              className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium text-text-strong">
                  {texts.support.categories[ticket.category] ?? ticket.category}
                </span>

                <span className="rounded-full border border-border-soft px-2 py-0.5">
                  {ticket.status === "OPEN"
                    ? texts.moderator.support.statusOpen
                    : ticket.status === "IN_PROGRESS"
                      ? texts.moderator.support.statusInProgress
                      : texts.moderator.support.statusClosed}
                </span>

                <span>{new Date(ticket.createdAt).toLocaleString("pt-BR")}</span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-strong">{ticket.subject}</p>

                <p className="mt-0.5 text-xs text-text-subtle">
                  {texts.moderator.support.from}:{" "}
                  <a
                    href={`mailto:${ticket.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {ticket.contactEmail}
                  </a>
                </p>
              </div>

              <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-strong">
                {ticket.message || texts.moderator.support.noMessage}
              </p>

              {ticket.imageUrl && (
                <a
                  href={ticket.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-primary hover:underline"
                >
                  {texts.moderator.support.image}
                </a>
              )}

              <div className="flex flex-wrap gap-2">
                {ticket.status === "OPEN" && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={move.isPending}
                    onClick={() => move.mutate({ id: ticket.id, next: "IN_PROGRESS" })}
                  >
                    {texts.moderator.support.start}
                  </Button>
                )}

                {ticket.status === "IN_PROGRESS" && (
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={move.isPending}
                    onClick={() => move.mutate({ id: ticket.id, next: "CLOSED" })}
                  >
                    {texts.moderator.support.resolve}
                  </Button>
                )}

                {ticket.status === "CLOSED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={move.isPending}
                    onClick={() => move.mutate({ id: ticket.id, next: "OPEN" })}
                  >
                    {texts.moderator.support.reopen}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border-soft text-text-subtle hover:border-primary/50 hover:text-primary",
      )}
    >
      {label}
    </button>
  );
}
