import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/require-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { MapPin, Sparkles, Briefcase, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobsApi } from "@/lib/api";
import type { Job } from "@/lib/api";

export const Route = createFileRoute("/vagas")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Vagas · Conexão" }] }),
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
  if (diffD < 1) return "Hoje";
  if (diffD < 30) return `Há ${diffD} dias`;
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

  const filters = { query: query || undefined, level: level || undefined, location: location || undefined, type: type || undefined, skills: skills || undefined };

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
    <AppShell>
      <div className="space-y-6">
        <div className="surface-card p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Oportunidades</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Vagas filtradas por nível, localização, tipo e habilidades.
              </p>
            </div>
            {hasFilters && (
              <Button size="sm" variant="ghost" className="rounded-full gap-1.5 text-muted-foreground" onClick={clearFilters}>
                <X className="h-4 w-4" /> Limpar filtros
              </Button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">Nível:</span>
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
              <span className="text-xs font-medium text-muted-foreground mr-1">Local:</span>
              {LOCATIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocation(location === l ? "" : l)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    location === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">Tipo:</span>
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
                placeholder="Buscar por título ou empresa..."
                className="h-9 rounded-full bg-muted pl-9"
              />
            </div>
            <Input
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Habilidades (ex: Java,Spring)"
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
                    <MapPin className="h-3 w-3" /> {j.location}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {j.matchScore && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 font-medium text-primary inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {j.matchScore}% match
                  </span>
                )}
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{j.type}</span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{j.level}</span>
                {j.salary && (
                  <span className="rounded-full bg-growth/15 px-2.5 py-1 font-medium text-growth">{j.salary}</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full bg-accent font-normal text-accent-foreground">
                    {s}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{formatPostedAt(j.postedAt)}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full">
                    Ver detalhes
                  </Button>
                  <Button size="sm" className="rounded-full" disabled={apply.isPending} onClick={() => apply.mutate(j.id)}>
                    Candidatar
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
          onLoadMore={() => { if (nextCursor) setCursor(nextCursor); }}
        />

        {!isFetching && allJobs.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma vaga encontrada com os filtros selecionados.
          </p>
        )}
      </div>
      
    </AppShell>
  );
}

function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}) {
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

  return (
    <div ref={sentinelRef} className="h-4" />
  );
}
