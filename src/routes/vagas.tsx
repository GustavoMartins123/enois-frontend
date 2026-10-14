import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { JOB_LEVELS, JOB_LOCATIONS, JOB_TYPES } from "@/constants/job-options";
import {
  FAKE_JOB_REPORT_REASON,
  JOB_REPORT_REASONS,
  MIN_REPUTATION_TO_CREATE_JOB,
} from "@/constants/job-rules";
import { texts } from "@/texts";
import type { CreateJobInput } from "@/types/application/job/create-job-input";
import type { Job } from "@/types/application/job/job";
import type { JobReportReason } from "@/types/application/job/job-report-reason";
import type { CreateJobDialogProps } from "@/types/routes/jobs/create-job-dialog-props";
import type { InfiniteScrollProps } from "@/types/routes/jobs/infinite-scroll-props";
import type { ReportJobDialogProps } from "@/types/routes/jobs/report-job-dialog-props";
import {
  AlertTriangle,
  Briefcase,
  Flag,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

import { jobsApi, reportsApi } from "@/lib/api";
import { useCurrentUser } from "@/lib/current-user";
import { canCreateJob, missingReputationToCreateJob } from "@/lib/job-permissions";
import { requireAuth } from "@/lib/require-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/vagas")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.jobs.seoTitle }] }),
  component: Vagas,
});

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-transparent bg-muted px-3 py-2 text-[13px] font-light text-text-strong outline-none focus-visible:ring-1 focus-visible:ring-ring";

function formatPostedAt(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffD = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffD < 1) return texts.jobs.today;
  if (diffD < 30) return texts.jobs.daysAgo(diffD);
  return date.toLocaleDateString("pt-BR");
}

function Vagas() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [skills, setSkills] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [reportTarget, setReportTarget] = useState<Job | null>(null);

  const reputation = user?.reputation ?? 0;
  const canPublish = canCreateJob(reputation);

  const filters = {
    query: query || undefined,
    level: level || undefined,
    location: location || undefined,
    type: type || undefined,
    skills: skills || undefined,
  };

  const { data: jobsData, isFetching } = useQuery({
    queryKey: ["jobs", filters, cursor],
    queryFn: () => jobsApi.list({ ...filters, cursor, limit: 10 }),
  });

  const jobs = jobsData?.items ?? [];
  const nextCursor = jobsData?.nextCursor ?? null;

  // Reset list when filters change
  const filtersKey = JSON.stringify(filters);
  const prevKey = useRef(filtersKey);
  useEffect(() => {
    if (prevKey.current !== filtersKey) {
      setAllJobs([]);
      setCursor(null);
      prevKey.current = filtersKey;
    }
  }, [filtersKey]);

  // Append new page to accumulated list
  useEffect(() => {
    if (cursor === null && jobs.length > 0) {
      setAllJobs(jobs);
    } else if (cursor !== null && jobs.length > 0) {
      setAllJobs((prev) => [...prev, ...jobs]);
    }
  }, [jobs, cursor]);

  const apply = useMutation({
    mutationFn: (jobId: string) => jobsApi.apply(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const activeCount = [level, location, type].filter(Boolean).length;
  const hasFilters = activeCount > 0 || skills !== "";

  const clearFilters = () => {
    setLevel("");
    setLocation("");
    setType("");
    setSkills("");
  };

  return (
    <AppContainer>
      <div className="space-y-6">
        <div className="surface-card p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{texts.jobs.title}</h1>

              <p className="mt-1 text-sm text-muted-foreground">{texts.jobs.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasFilters && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-full gap-1.5 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />

                  <>{texts.jobs.clearFilters}</>
                </Button>
              )}

              <Button
                size="sm"
                className="rounded-full gap-1.5"
                onClick={() => setShowCreate(true)}
              >
                {canPublish ? <Plus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}

                <>{texts.jobs.createJob}</>
              </Button>
            </div>
          </div>

          {!canPublish && (
            <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-3 w-3 shrink-0" />

              <>{texts.jobs.gate.missing(missingReputationToCreateJob(reputation))}</>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {texts.jobs.filters.level}
              </span>
              {JOB_LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(level === l ? "" : l)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    level === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.charAt(0) + l.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {texts.jobs.filters.location}
              </span>
              {JOB_LOCATIONS.map((l, index) => (
                <button
                  key={l}
                  onClick={() => setLocation(location === l ? "" : l)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    location === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {texts.jobs.filters.locations[index]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {texts.jobs.filters.type}
              </span>
              {JOB_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(type === t ? "" : t)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    type === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="relative max-w-sm flex-1">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={texts.jobs.searchPlaceholder}
                className="h-9 rounded-full bg-muted pl-9"
              />
            </div>

            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder={texts.jobs.skillsPlaceholder}
              className="h-9 rounded-full bg-muted max-w-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {allJobs.map((j) => (
            <article key={j.id} className="surface-card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  {j.logo && <AvatarImage src={j.logo} alt={j.company} className="rounded-xl" />}
                  <AvatarFallback className="rounded-xl">{j.company[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold">{j.title}</h3>

                  <p className="break-words text-sm text-muted-foreground">{j.company}</p>

                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />

                    <>{j.location}</>
                  </p>
                </div>
              </div>

              {j.isFake && (
                <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3 w-3" />

                  <>{texts.jobs.fakeBadge}</>
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {j.matchScore && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />

                    <>{texts.jobs.match(j.matchScore)}</>
                  </span>
                )}
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  {j.type}
                </span>

                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                  {j.level}
                </span>
                {j.salary && (
                  <span className="rounded-full bg-growth/15 px-2.5 py-1 font-medium text-growth">
                    {j.salary}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="rounded-full bg-accent font-normal text-accent-foreground"
                  >
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{formatPostedAt(j.postedAt)}</span>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    onClick={() => setReportTarget(j)}
                  >
                    <Flag className="h-3.5 w-3.5" />

                    <>{texts.jobs.report.action}</>
                  </Button>

                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={apply.isPending}
                    onClick={() => apply.mutate(j.id)}
                  >
                    {texts.jobs.apply}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {isFetching && allJobs.length > 0 && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        <InfiniteScroll
          hasMore={!!nextCursor}
          loading={isFetching}
          onLoadMore={() => {
            if (nextCursor) setCursor(nextCursor);
          }}
        />

        {!isFetching && allJobs.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">{texts.jobs.empty}</p>
        )}
      </div>

      <CreateJobDialog open={showCreate} onOpenChange={setShowCreate} />
      <ReportJobDialog job={reportTarget} onOpenChange={(open) => !open && setReportTarget(null)} />
    </AppContainer>
  );
}

function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const reputation = user?.reputation ?? 0;
  const canPublish = canCreateJob(reputation);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState<string>(JOB_LOCATIONS[0]);
  const [type, setType] = useState<string>(JOB_TYPES[0]);
  const [level, setLevel] = useState<string>(JOB_LEVELS[0]);
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (data: CreateJobInput) => jobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onOpenChange(false);
    },
    onError: () => setError(texts.jobs.createError),
  });

  const reset = () => {
    setTitle("");
    setCompany("");
    setLocation(JOB_LOCATIONS[0]);
    setType(JOB_TYPES[0]);
    setLevel(JOB_LEVELS[0]);
    setSalary("");
    setSkills("");
    setDescription("");
    setError(null);
  };

  const submit = () => {
    setError(null);
    create.mutate({
      title: title.trim(),
      company: company.trim(),
      location,
      type,
      level,
      salary: salary.trim() || undefined,
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: description.trim() || undefined,
    });
  };

  const valid = title.trim() !== "" && company.trim() !== "";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-light">{texts.jobs.createJobTitle}</DialogTitle>

          <DialogDescription>{texts.jobs.createJobDescription}</DialogDescription>
        </DialogHeader>

        {!canPublish ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-medium text-foreground">{texts.jobs.gate.title}</p>

                <p className="mt-1">
                  {texts.jobs.gate.requirement(MIN_REPUTATION_TO_CREATE_JOB)}{" "}
                  {texts.jobs.gate.current(reputation)}
                </p>

                <p className="mt-1">
                  {texts.jobs.gate.missing(missingReputationToCreateJob(reputation))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.fields.title}
              </Label>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={texts.jobs.fields.titlePlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.fields.company}
              </Label>

              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={texts.jobs.fields.companyPlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-light text-text-subtle">
                  {texts.jobs.fields.location}
                </Label>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {JOB_LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-light text-text-subtle">
                  {texts.jobs.fields.type}
                </Label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-light text-text-subtle">
                  {texts.jobs.fields.level}
                </Label>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={SELECT_CLASS}
                >
                  {JOB_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0) + l.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.fields.salary}
              </Label>

              <Input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder={texts.jobs.fields.salaryPlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.fields.skills}
              </Label>

              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder={texts.jobs.fields.skillsPlaceholder}
                className="bg-muted"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.fields.description}
              </Label>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={texts.jobs.fields.descriptionPlaceholder}
                className="bg-muted"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              className="w-full rounded-full"
              disabled={!valid || create.isPending}
              onClick={submit}
            >
              {create.isPending ? texts.common.publishing : texts.jobs.createAction}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportJobDialog({ job, onOpenChange }: ReportJobDialogProps) {
  const [reason, setReason] = useState<JobReportReason>(FAKE_JOB_REPORT_REASON);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const report = useMutation({
    mutationFn: (targetId: string) =>
      reportsApi.create({
        targetId,
        targetType: "JOB",
        reason,
        description: description || undefined,
      }),
    onSuccess: () => setDone(true),
    onError: () => setError(texts.jobs.report.error),
  });

  const reset = () => {
    setReason(FAKE_JOB_REPORT_REASON);
    setDescription("");
    setError(null);
    setDone(false);
  };

  const isFake = reason === FAKE_JOB_REPORT_REASON;

  return (
    <Dialog
      open={!!job}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-light">{texts.jobs.report.title}</DialogTitle>

          <DialogDescription>{job?.title}</DialogDescription>
        </DialogHeader>

        {done ? (
          <p className="pt-2 text-sm text-muted-foreground">{texts.jobs.report.success}</p>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.report.reason}
              </Label>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as JobReportReason)}
                className={SELECT_CLASS}
              >
                {JOB_REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r === FAKE_JOB_REPORT_REASON
                      ? texts.jobs.report.fakeLabel
                      : r.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </select>

              {isFake && (
                <p className="text-xs text-muted-foreground">{texts.jobs.report.fakeHint}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-light text-text-subtle">
                {texts.jobs.report.description}
              </Label>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="bg-muted"
              />
            </div>

            {isFake && (
              <p className="flex items-start gap-1.5 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                <>{texts.jobs.report.fakeWarning}</>
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button
              className="w-full rounded-full"
              disabled={report.isPending || !job}
              onClick={() => job && report.mutate(job.id)}
            >
              {report.isPending ? texts.common.sending : texts.jobs.report.action}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfiniteScroll({ hasMore, loading, onLoadMore }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!hasMore) return null;

  return <div ref={sentinelRef} className="h-4" />;
}
