import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { ModeratorApplicationView } from "@/types/application/moderation/moderator-application-view";
import type { ModeratorMeView } from "@/types/application/moderation/moderator-me-view";
import { ArrowLeft, Check, Gavel, Shield, ShieldCheck, X } from "lucide-react";

import { moderationApi } from "@/lib/api";
import { reportsAdminApi } from "@/lib/api/reports-admin";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/moderador")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.moderator.seoTitle }] }),
  component: Moderador,
});

/**
 * Painel de moderador.
 *
 * - Sem papel: mostra a credibilidade e, se elegível (> 500), o formulário de candidatura.
 * - Moderador aprovado: a fila de denúncias com o voto de punir/descartar.
 * - Admin: tudo acima + candidaturas pendentes + punição direta de qualquer usuário.
 *
 * Quem decide o papel é o backend; esta tela só reflete `/moderation/me`.
 */
function Moderador() {
  const {
    data: me,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moderator", "me"],
    queryFn: () => moderationApi.me(),
    retry: false,
  });

  if (isLoading) {
    return (
      <AppContainer>
        <div className="mx-auto w-full max-w-3xl">
          <LoadingState />
        </div>
      </AppContainer>
    );
  }

  if (error || !me) {
    return (
      <AppContainer>
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border-soft bg-surface-card p-6 text-sm text-text-subtle">
          {texts.moderator.error}
        </div>
      </AppContainer>
    );
  }

  const canModerate = me.moderator || me.admin;

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.moderator.back}</>
        </Link>

        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{texts.moderator.title}</h1>

            {me.admin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />

                <>{texts.moderator.adminBadge}</>
              </span>
            )}

            {!me.admin && me.moderator && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-text">
                <Shield className="h-3.5 w-3.5" />

                <>{texts.moderator.moderatorBadge}</>
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">{texts.moderator.description}</p>
        </header>

        {canModerate ? <ReportsSection admin={me.admin} /> : <ApplicationSection me={me} />}

        {me.admin && <ApplicationsSection />}

        {me.admin && <SanctionSection />}
      </div>
    </AppContainer>
  );
}

function ApplicationSection({ me }: { me: ModeratorMeView }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");

  const apply = useMutation({
    mutationFn: () =>
      moderationApi.apply({
        motivation: motivation.trim(),
        experience: experience.trim() || undefined,
        availability: availability.trim() || undefined,
      }),
    onSuccess: () => {
      toast(texts.moderator.eligibility.sent, "success");
      setMotivation("");
      setExperience("");
      setAvailability("");
      void queryClient.invalidateQueries({ queryKey: ["moderator", "me"] });
    },
    onError: () => toast(texts.moderator.eligibility.error, "error"),
  });

  const application = me.application;
  const pending = application?.status === "PENDING";
  const rejected = application?.status === "REJECTED";
  const revoked = application?.status === "REVOKED";
  const showForm = me.eligible && !pending && !me.moderator;

  return (
    <section className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
      <h2 className="text-base font-medium">{texts.moderator.eligibility.title}</h2>

      <p className="text-sm text-muted-foreground">
        {texts.moderator.eligibility.description(me.minReputation)}
      </p>

      <p className="text-sm font-medium text-text-strong">
        {texts.moderator.eligibility.reputation(me.reputation, me.minReputation)}
      </p>

      {!me.eligible && (
        <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-subtle">
          {texts.moderator.eligibility.low(me.minReputation)}
        </p>
      )}

      {pending && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft px-4 py-3">
          <p className="text-sm font-medium text-primary-text">
            {texts.moderator.eligibility.pendingTitle}
          </p>

          <p className="mt-1 text-sm text-text-subtle">{texts.moderator.eligibility.pendingBody}</p>

          {application.reviewNote && (
            <p className="mt-2 text-xs text-text-subtle">{application.reviewNote}</p>
          )}
        </div>
      )}

      {(rejected || revoked) && (
        <div className="rounded-xl border border-border-soft bg-surface-2 px-4 py-3">
          <p className="text-sm font-medium text-text-strong">
            {rejected
              ? texts.moderator.eligibility.rejectedTitle
              : texts.moderator.eligibility.revokedTitle}
          </p>

          {application?.reviewNote && (
            <p className="mt-1 text-sm text-text-subtle">{application.reviewNote}</p>
          )}
        </div>
      )}

      {showForm && (
        <form
          className="space-y-3 pt-1"
          onSubmit={(event) => {
            event.preventDefault();
            if (motivation.trim().length < 20) return;
            apply.mutate();
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm font-medium text-text-strong">
              {texts.moderator.eligibility.motivation}
            </span>

            <Textarea
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={texts.moderator.eligibility.motivationPlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-text-strong">
              {texts.moderator.eligibility.experience}
            </span>

            <Textarea
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder={texts.moderator.eligibility.experiencePlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-text-strong">
              {texts.moderator.eligibility.availability}
            </span>

            <Input
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              maxLength={500}
              placeholder={texts.moderator.eligibility.availabilityPlaceholder}
            />
          </label>

          <Button
            type="submit"
            className="rounded-full"
            disabled={apply.isPending || motivation.trim().length < 20}
          >
            {apply.isPending ? texts.common.sending : texts.moderator.eligibility.apply}
          </Button>
        </form>
      )}
    </section>
  );
}

function ReportsSection({ admin }: { admin: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["moderator", "reports"],
    queryFn: () => moderationApi.reports(),
    retry: false,
  });

  const vote = useMutation({
    mutationFn: ({ reportId, vote }: { reportId: string; vote: "PUNISH" | "DISMISS" }) =>
      moderationApi.vote(reportId, vote),
    onSuccess: (result) => {
      toast(result.message, "success");
      void queryClient.invalidateQueries({ queryKey: ["moderator", "reports"] });
    },
    onError: () => toast(texts.moderator.reports.voteError, "error"),
  });

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  // Ações diretas do admin no card: remover a postagem (approve do fluxo, que apaga o post) e
  // avisar o autor (a denúncia é revisada e o conteúdo fica). Nenhuma delas bane a conta.
  const adminAction = useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: "remove" | "warn" }) =>
      action === "remove"
        ? reportsAdminApi.deletePost(reportId, "Removido pelo painel de moderador")
        : reportsAdminApi.warn(reportId),
    onSuccess: (_result, variables) => {
      toast(
        variables.action === "remove"
          ? texts.moderator.reports.removeDone
          : texts.moderator.reports.warnDone,
        "success",
      );
      void queryClient.invalidateQueries({ queryKey: ["moderator", "reports"] });
    },
    onError: () => toast(texts.moderator.reports.actionError, "error"),
  });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
        {texts.moderator.reports.title}
      </h2>

      {isLoading ? (
        <LoadingState />
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-surface-card">
          <EmptyState icon={Gavel} title={texts.moderator.reports.empty} />
        </div>
      ) : (
        <ul className="space-y-3">
          {data!.map((report) => (
            <li
              key={report.reportId}
              className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-subtle">
                <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium text-text-strong">
                  {texts.moderator.reports.reason}: {report.reason}
                </span>

                <span className="rounded-full border border-border-soft px-2 py-0.5">
                  {texts.moderator.reports.target}: {report.targetType.toLowerCase()}
                </span>

                <span>{new Date(report.createdAt).toLocaleString("pt-BR")}</span>
              </div>

              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-text-subtle">{texts.moderator.reports.reporter}: </span>

                  <span className="text-text-strong">{report.reporter}</span>
                </p>

                <p>
                  <span className="text-text-subtle">{texts.moderator.reports.author}: </span>

                  <span className="text-text-strong">
                    {report.author || texts.moderator.reports.noAuthor}
                  </span>
                </p>
              </div>

              <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-surface-2 px-3 py-2 text-sm text-text-strong">
                {report.content || texts.moderator.reports.noContent}
              </p>

              {report.description && (
                <p className="text-xs text-text-subtle">“{report.description}”</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-text-subtle">
                  {texts.moderator.reports.votes(
                    report.punishVotes,
                    report.dismissVotes,
                    report.quorum,
                  )}
                  {report.myVote && (
                    <span className="ml-2 text-primary">
                      {texts.moderator.reports.myVote(report.myVote)}
                    </span>
                  )}
                </p>

                {admin && (
                  <Link
                    to="/moderacao/$reportId"
                    params={{ reportId: report.reportId }}
                    className="text-xs text-primary hover:underline"
                  >
                    {texts.moderator.reports.openReview}
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full gap-1.5"
                  disabled={vote.isPending}
                  onClick={() => vote.mutate({ reportId: report.reportId, vote: "PUNISH" })}
                >
                  <Check className="h-3.5 w-3.5" />

                  <>{texts.moderator.reports.punish}</>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full gap-1.5"
                  disabled={vote.isPending}
                  onClick={() => vote.mutate({ reportId: report.reportId, vote: "DISMISS" })}
                >
                  <X className="h-3.5 w-3.5" />

                  <>{texts.moderator.reports.dismiss}</>
                </Button>
              </div>

              {admin && (
                <div className="flex flex-wrap items-center gap-2 border-t border-border-soft pt-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-text-subtle">
                    {texts.moderator.reports.adminActions}
                  </span>

                  {report.targetType === "POST" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={adminAction.isPending}
                      onClick={() => setRemoveTarget(report.reportId)}
                    >
                      {texts.moderator.reports.removePost}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={adminAction.isPending}
                    onClick={() =>
                      adminAction.mutate({ reportId: report.reportId, action: "warn" })
                    }
                  >
                    {texts.moderator.reports.warn}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title={texts.moderator.reports.removeTitle}
        description={texts.moderator.reports.removeBody}
        confirmLabel={texts.moderator.reports.removePost}
        destructive
        pending={adminAction.isPending}
        onConfirm={() => {
          if (!removeTarget) return;
          adminAction.mutate({ reportId: removeTarget, action: "remove" });
          setRemoveTarget(null);
        }}
      />
    </section>
  );
}

function ApplicationsSection() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["moderator", "applications"],
    queryFn: () => moderationApi.applications(),
    retry: false,
  });

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
        {texts.moderator.admin.applicationsTitle}
      </h2>

      {isLoading ? (
        <LoadingState />
      ) : (data?.length ?? 0) === 0 ? (
        <p className="rounded-2xl border border-border-soft bg-surface-card p-4 text-sm text-text-subtle">
          {texts.moderator.admin.applicationsEmpty}
        </p>
      ) : (
        <ul className="space-y-3">
          {data!.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onDecided={() => {
                void queryClient.invalidateQueries({ queryKey: ["moderator", "applications"] });
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ApplicationCard({
  application,
  onDecided,
}: {
  application: ModeratorApplicationView;
  onDecided: () => void;
}) {
  const { toast } = useToast();
  const [note, setNote] = useState("");

  const decide = useMutation({
    mutationFn: (approve: boolean) =>
      approve
        ? moderationApi.approveApplication(application.id, note.trim() || undefined)
        : moderationApi.rejectApplication(application.id, note.trim()),
    onSuccess: (_result, approve) => {
      toast(approve ? texts.moderator.admin.approved : texts.moderator.admin.rejected, "success");
      onDecided();
    },
    onError: () => toast(texts.moderator.admin.decisionError, "error"),
  });

  return (
    <li className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4">
      <p className="text-xs text-text-subtle">
        {texts.moderator.admin.applicant}:{" "}
        <span className="text-text-strong">
          {application.name ?? application.username ?? application.userId}
        </span>
        {application.username && <span> (@{application.username})</span>}
        {" · "}
        {new Date(application.createdAt).toLocaleString("pt-BR")}
      </p>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
          {texts.moderator.admin.motivation}
        </p>

        <p className="whitespace-pre-wrap text-sm text-text-strong">{application.motivation}</p>
      </div>

      {application.experience && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-subtle">
            {texts.moderator.admin.experience}
          </p>

          <p className="whitespace-pre-wrap text-sm text-text-subtle">{application.experience}</p>
        </div>
      )}

      {application.availability && (
        <p className="text-xs text-text-subtle">
          {texts.moderator.admin.availability}: {application.availability}
        </p>
      )}

      <label className="block space-y-1">
        <span className="text-sm font-medium text-text-strong">{texts.moderator.admin.note}</span>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          rows={2}
          placeholder={texts.moderator.admin.notePlaceholder}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="rounded-full"
          disabled={decide.isPending}
          onClick={() => decide.mutate(true)}
        >
          {texts.moderator.admin.approve}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          className="rounded-full"
          disabled={decide.isPending || note.trim().length < 5}
          onClick={() => decide.mutate(false)}
        >
          {texts.moderator.admin.reject}
        </Button>
      </div>
    </li>
  );
}

function SanctionSection() {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [type, setType] = useState<"RESTRICTION" | "BAN">("RESTRICTION");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sanction = useMutation({
    mutationFn: () => moderationApi.sanctionUser(username.trim(), type, reason.trim()),
    onSuccess: (result) => {
      toast(texts.moderator.admin.done(result.username, result.type), "success");
      setUsername("");
      setReason("");
      setType("RESTRICTION");
    },
    onError: () => toast(texts.moderator.admin.error, "error"),
  });

  const valid = username.trim().length > 0 && reason.trim().length >= 10;

  return (
    <section className="space-y-3 rounded-2xl border border-border-soft bg-surface-card p-4 sm:p-5">
      <h2 className="text-base font-medium">{texts.moderator.admin.sanctionTitle}</h2>

      <p className="text-sm text-muted-foreground">{texts.moderator.admin.sanctionDescription}</p>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!valid) return;
          setConfirmOpen(true);
        }}
      >
        <label className="block space-y-1">
          <span className="text-sm font-medium text-text-strong">
            {texts.moderator.admin.username}
          </span>

          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={80}
            placeholder={texts.moderator.admin.usernamePlaceholder}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-text-strong">{texts.moderator.admin.type}</span>

          <select
            value={type}
            onChange={(event) => setType(event.target.value as "RESTRICTION" | "BAN")}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          >
            <option value="RESTRICTION">{texts.moderator.admin.restriction}</option>

            <option value="BAN">{texts.moderator.admin.ban}</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-text-strong">
            {texts.moderator.admin.reason}
          </span>

          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={texts.moderator.admin.reasonPlaceholder}
          />
        </label>

        <Button type="submit" variant="destructive" className="rounded-full" disabled={!valid}>
          {texts.moderator.admin.apply}
        </Button>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={texts.moderator.admin.confirmTitle}
        description={texts.moderator.admin.confirmBody(username.trim(), type)}
        confirmLabel={texts.moderator.admin.apply}
        destructive
        pending={sanction.isPending}
        onConfirm={() => {
          setConfirmOpen(false);
          sanction.mutate();
        }}
      />
    </section>
  );
}
