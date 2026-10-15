import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import { texts } from "@/texts";
import { ArrowLeft, Briefcase, CheckCircle2, Loader2, Users } from "lucide-react";

import { jobsApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/vagas/minhas")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.jobs.myJobs }] }),
  component: MyJobs,
});

function formatPostedAt(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return texts.jobs.today;
  return texts.jobs.daysAgo(days);
}

function MyJobs() {
  const mine = useQuery({ queryKey: ["jobs", "mine"], queryFn: () => jobsApi.mine(undefined, 20) });
  const applications = useQuery({
    queryKey: ["jobs", "applications"],
    queryFn: () => jobsApi.applications(undefined, 20),
  });

  const loading = mine.isLoading || applications.isLoading;

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link
          to="/vagas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          <>{texts.jobs.back}</>
        </Link>

        {loading ? (
          <div className="surface-card p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <section className="surface-card p-4 sm:p-6">
              <h1 className="text-xl font-semibold tracking-tight">{texts.jobs.myJobs}</h1>

              {(mine.data?.items ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">{texts.jobs.myJobsEmpty}</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {(mine.data?.items ?? []).map((job) => (
                    <li key={job.id} className="rounded-xl border border-border-soft p-3">
                      <Link to="/vagas/$jobId" params={{ jobId: job.id }} className="block min-w-0">
                        <p className="truncate text-[14px] font-medium text-text-strong">
                          {job.title}
                        </p>

                        <p className="mt-0.5 text-[12px] font-light text-text-subtle">
                          {job.company}
                          {" · "}
                          {formatPostedAt(job.postedAt)}
                        </p>
                      </Link>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-1.5 text-[12px] font-light text-primary">
                          <Users className="h-3.5 w-3.5" />

                          <>{texts.jobs.applicationsCount(job.applicationsCount ?? 0)}</>
                        </p>

                        <Link to="/vagas/$jobId/candidaturas" params={{ jobId: job.id }}>
                          <Button variant="outline" size="sm" className="rounded-full">
                            {texts.jobs.applications.link}
                          </Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="surface-card p-4 sm:p-6">
              <h2 className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight">
                <Briefcase className="h-5 w-5 text-primary" />

                <>{texts.jobs.myApplications}</>
              </h2>

              {(applications.data?.items ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {texts.jobs.myApplicationsEmpty}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {(applications.data?.items ?? []).map((job) => (
                    <li key={job.id} className="rounded-xl border border-border-soft p-3">
                      <Link to="/vagas/$jobId" params={{ jobId: job.id }} className="block min-w-0">
                        <p className="truncate text-[14px] font-medium text-text-strong">
                          {job.title}
                        </p>

                        <p className="mt-0.5 text-[12px] font-light text-text-subtle">
                          {job.company}
                          {" · "}
                          {formatPostedAt(job.postedAt)}
                        </p>
                      </Link>

                      <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-light text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        <>{texts.jobs.applied}</>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </AppContainer>
  );
}
