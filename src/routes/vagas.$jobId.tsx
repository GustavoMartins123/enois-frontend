import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { texts } from "@/texts";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Loader2,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";

import { jobsApi } from "@/lib/api";

import { Button } from "@/components/ui/button";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/vagas/$jobId")({
  head: () => ({ meta: [{ title: texts.jobs.seoTitle }] }),
  component: JobDetail,
});

function formatPostedAt(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return texts.jobs.today;
  return texts.jobs.daysAgo(days);
}

function JobDetail() {
  const { jobId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobsApi.get(jobId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["job", jobId] });
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
  };

  const apply = useMutation({ mutationFn: () => jobsApi.apply(jobId), onSuccess: invalidate });
  const toggleSave = useMutation({
    mutationFn: (saved: boolean) => (saved ? jobsApi.removeSave(jobId) : jobsApi.save(jobId)),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: () => jobsApi.remove(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate({ to: "/vagas" });
    },
  });

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Link
          to="/vagas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.jobs.back}</>
        </Link>

        {isLoading ? (
          <div className="surface-card p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError || !job ? (
          <div className="surface-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{texts.jobs.notFound}</p>
          </div>
        ) : (
          <div className="surface-card p-4 sm:p-6">
            <header className="flex items-start gap-3 border-b border-border-soft pb-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-2">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>

                <p className="mt-0.5 text-sm text-text-subtle">
                  {job.company}
                  {job.location ? (
                    <>
                      {" · "}
                      <MapPin className="mb-0.5 inline h-3.5 w-3.5" />
                      {job.location}
                    </>
                  ) : null}
                </p>

                <p className="mt-1 text-[12px] font-light text-text-date">
                  {formatPostedAt(job.postedAt)}
                </p>
              </div>
            </header>

            <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
              <span className="rounded-full border border-border-soft px-2.5 py-1">{job.type}</span>

              <span className="rounded-full border border-border-soft px-2.5 py-1">
                {job.level}
              </span>

              {job.salary && (
                <span className="rounded-full border border-border-soft px-2.5 py-1">
                  {job.salary}
                </span>
              )}
            </div>

            {job.owner && (
              <div className="mt-4 rounded-xl bg-surface-2 p-3">
                <p className="text-[13px] font-medium text-text-strong">{texts.jobs.ownerBadge}</p>

                <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-light text-text-subtle">
                  <Users className="h-3.5 w-3.5" />

                  <>{texts.jobs.applicationsCount(job.applicationsCount ?? 0)}</>
                </p>
              </div>
            )}

            <section className="mt-5">
              <h2 className="text-[15px] font-light text-text-strong">{texts.jobs.about}</h2>

              <p className="mt-2 whitespace-pre-line break-words text-[13px] font-light leading-relaxed text-text-subtle">
                {job.description?.trim() || texts.jobs.description}
              </p>
            </section>

            <section className="mt-5">
              <h2 className="text-[15px] font-light text-text-strong">{texts.jobs.skills}</h2>

              {job.skills?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border-soft bg-transparent px-2.5 py-1 text-[12px] font-light text-text-subtle"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] font-light text-text-subtle">
                  {texts.jobs.noSkills}
                </p>
              )}
            </section>

            <footer className="mt-6 flex flex-wrap items-center gap-2 border-t border-border-soft pt-4">
              {job.owner ? (
                <Button
                  variant="destructive"
                  className="rounded-full gap-2"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(texts.jobs.deleteConfirm)) remove.mutate();
                  }}
                >
                  <Trash2 className="h-4 w-4" />

                  <>{texts.jobs.deleteJob}</>
                </Button>
              ) : job.applied ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-[13px] font-medium text-primary">
                  <CheckCircle2 className="h-4 w-4" />

                  <>{texts.jobs.applied}</>
                </span>
              ) : (
                <Button
                  className="rounded-full"
                  disabled={apply.isPending}
                  onClick={() => apply.mutate()}
                >
                  {apply.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    texts.jobs.apply
                  )}
                </Button>
              )}

              {!job.owner && (
                <Button
                  variant="outline"
                  className="rounded-full gap-2"
                  disabled={toggleSave.isPending}
                  onClick={() => toggleSave.mutate(Boolean(job.saved))}
                >
                  <Bookmark className={job.saved ? "h-4 w-4 text-primary" : "h-4 w-4"} />

                  <>{job.saved ? texts.jobs.saved : texts.jobs.save}</>
                </Button>
              )}
            </footer>

            {job.applied && !job.owner && (
              <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[12px] font-light text-text-subtle">
                {texts.jobs.appliedHint}
              </p>
            )}

            {(apply.isError || toggleSave.isError || remove.isError) && (
              <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {texts.errors.unexpected}
              </p>
            )}
          </div>
        )}
      </div>
    </AppContainer>
  );
}
