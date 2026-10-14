import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { texts } from "@/texts";
import type { Job } from "@/types/application/job/job";
import type { InfiniteScrollProps } from "@/types/routes/jobs/infinite-scroll-props";
import { Briefcase, Loader2, MapPin, Sparkles, X } from "lucide-react";

import { jobsApi } from "@/lib/api";
import { requireAuth } from "@/lib/require-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/vagas")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: texts.jobs.seoTitle }] }),
  component: Vagas,
});

const LEVELS = ["JUNIOR", "MID", "SENIOR", "LEAD"];
const LOCATIONS = ["Remoto", "Híbrido", "Presencial"];
const TYPES = ["CLT", "PJ", "FREELANCE", "INTERN"];

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
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [skills, setSkills] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

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
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                {texts.jobs.filters.level}
              </span>
              {LEVELS.map((l) => (
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
              {LOCATIONS.map((l, index) => (
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
              {TYPES.map((t) => (
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
                  <Button size="sm" variant="outline" className="rounded-full">
                    {texts.jobs.details}
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
    </AppContainer>
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
