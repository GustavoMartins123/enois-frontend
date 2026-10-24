import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { MonitoringEvent } from "@/types/application/monitoring/monitoring-event";
import type { MonitoringEventLevel } from "@/types/application/monitoring/monitoring-event-level";
import type { MonitoringMinutePoint } from "@/types/application/monitoring/monitoring-minute-point";
import { Activity, AlertTriangle, Cpu, Pause, Play, RefreshCw, Search, Server } from "lucide-react";

import { monitoringApi } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";

const number = new Intl.NumberFormat("pt-BR");

const LEVEL_CLASS: Record<MonitoringEventLevel, string> = {
  ERROR: "bg-destructive/10 text-destructive",
  WARN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INFO: "bg-primary-soft text-primary-text",
  DEBUG: "bg-surface-2 text-text-subtle",
};

/**
 * Monitorabilidade do painel admin: KPIs, séries por minuto e a lista de eventos/logs/erros.
 * O backend já entrega tudo pronto; aqui só desenhamos os gráficos em SVG (sem lib) e atualizamos
 * por polling curto, que é o "tempo real" sem manter uma conexão SSE aberta por admin.
 */
export function MonitoringSection() {
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const overview = useQuery({
    queryKey: ["monitoring", "overview"],
    queryFn: () => monitoringApi.overview(),
    refetchInterval: paused ? false : 2_500,
    retry: false,
  });

  const filtered = Boolean(level || type || debounced);
  const events = useQuery({
    queryKey: ["monitoring", "events", level, type, debounced],
    queryFn: () =>
      monitoringApi.events({
        level: level || undefined,
        type: type || undefined,
        q: debounced || undefined,
      }),
    enabled: filtered,
    refetchInterval: paused ? false : 3_000,
    retry: false,
  });

  const data = overview.data;
  const rows = filtered ? (events.data ?? []) : (data?.recent ?? []);
  const types = useMemo(() => data?.types24h.map((item) => item.label) ?? [], [data]);

  if (overview.isLoading) {
    return <LoadingState />;
  }

  if (!data) {
    return (
      <section className="surface-card p-4 text-sm text-text-subtle">
        {texts.moderator.monitoring.error}
      </section>
    );
  }

  const heapPercent =
    data.jvm.heapMaxBytes > 0 ? (data.jvm.heapUsedBytes / data.jvm.heapMaxBytes) * 100 : 0;

  return (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-medium">
            <Activity className="h-5 w-5 text-primary" />
            {texts.moderator.monitoring.title}
          </h2>

          <p className="mt-1 text-xs text-text-subtle">{texts.moderator.monitoring.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
              paused ? "bg-surface-2 text-text-subtle" : "bg-growth/10 text-growth",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                paused ? "bg-text-subtle" : "animate-pulse bg-growth",
              )}
            />

            <>{paused ? texts.moderator.monitoring.paused : texts.moderator.monitoring.live}</>
          </span>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-1.5"
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}

            <>{paused ? texts.moderator.monitoring.resume : texts.moderator.monitoring.pause}</>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            title={texts.moderator.monitoring.refresh}
            aria-label={texts.moderator.monitoring.refresh}
            onClick={() => void overview.refetch()}
          >
            <RefreshCw className={cn("h-4 w-4", overview.isFetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          label={texts.moderator.monitoring.requestsPerMinute}
          value={number.format(data.requestsLastMinute)}
        />
        <Kpi
          label={texts.moderator.monitoring.errors5xx}
          value={number.format(data.errors5xxLastMinute)}
          tone="danger"
        />
        <Kpi
          label={texts.moderator.monitoring.errors4xx}
          value={number.format(data.errors4xxLastMinute)}
          tone="warn"
        />
        <Kpi label={texts.moderator.monitoring.p95} value={`${number.format(data.p95Ms)} ms`} />
        <Kpi label={texts.moderator.monitoring.errorRate} value={`${data.errorRate.toFixed(1)}%`} />
        <Kpi label={texts.moderator.monitoring.uptime} value={formatUptime(data.uptimeSeconds)} />
        <Kpi
          label={texts.moderator.monitoring.heap}
          value={`${Math.round(data.jvm.heapUsedBytes / 1024 / 1024)} / ${Math.round(data.jvm.heapMaxBytes / 1024 / 1024)} MB`}
        />
        <Kpi label={texts.moderator.monitoring.threads} value={number.format(data.jvm.threads)} />
      </div>

      {data.droppedEvents > 0 && (
        <p className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {texts.moderator.monitoring.dropped(data.droppedEvents)}
        </p>
      )}

      <div className="grid min-w-0 gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="surface-card min-w-0 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
              {texts.moderator.monitoring.chartTitle}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-text-subtle">
              <Legend color="var(--primary)" label={texts.moderator.monitoring.legendRequests} />
              <Legend color="var(--destructive)" label={texts.moderator.monitoring.legendErrors} />
            </div>
          </div>

          <TrafficChart series={data.series} />
        </div>

        <div className="surface-card min-w-0 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {texts.moderator.monitoring.topRoutes}
          </p>

          {data.topRoutes.length === 0 ? (
            <p className="text-xs text-text-subtle">{texts.moderator.monitoring.noRoutes}</p>
          ) : (
            <ul className="space-y-1.5">
              {data.topRoutes.map((item) => (
                <li
                  key={item.label}
                  className="flex min-w-0 items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate font-mono text-text-strong">{item.label}</span>

                  <span className="shrink-0 tabular-nums text-text-subtle">
                    {number.format(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 border-t border-border-soft pt-2 text-[11px] text-text-subtle">
            <p className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              {texts.moderator.monitoring.jvmLine(
                Math.round(heapPercent),
                data.jvm.processors,
                data.droppedEvents,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card min-w-0 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-subtle">
            {texts.moderator.monitoring.eventsTitle}
          </p>

          <span className="text-[10px] text-text-subtle">
            {texts.moderator.monitoring.updatedAt(
              new Date(data.generatedAt).toLocaleTimeString("pt-BR", { hour12: false }),
            )}
          </span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            aria-label={texts.moderator.monitoring.levelFilter}
            className="h-8 rounded-lg border border-border-soft bg-surface-1 px-2 text-xs text-text-strong"
          >
            <option value="">{texts.moderator.monitoring.allLevels}</option>

            <option value="ERROR">ERROR</option>

            <option value="WARN">WARN</option>

            <option value="INFO">INFO</option>

            <option value="DEBUG">DEBUG</option>
          </select>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label={texts.moderator.monitoring.typeFilter}
            className="h-8 max-w-[11rem] rounded-lg border border-border-soft bg-surface-1 px-2 text-xs text-text-strong"
          >
            <option value="">{texts.moderator.monitoring.allTypes}</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="relative min-w-[10rem] flex-1">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-subtle" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={texts.moderator.monitoring.searchPlaceholder}
              className="h-8 pl-7 text-xs"
              aria-label={texts.moderator.monitoring.searchPlaceholder}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setLevel("ERROR");
              setType("");
              setSearch("");
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs",
              level === "ERROR"
                ? "bg-destructive text-primary-foreground"
                : "border border-border-soft text-text-subtle hover:text-destructive",
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {texts.moderator.monitoring.onlyFailures}
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="py-6 text-center text-xs text-text-subtle">
            {filtered ? texts.moderator.monitoring.noFiltered : texts.moderator.monitoring.empty}
          </p>
        ) : (
          <div className="max-h-[28rem] overflow-auto rounded-lg border border-border-soft">
            <table className="w-full min-w-[42rem] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10 bg-surface-2 text-[10px] uppercase tracking-wide text-text-subtle">
                <tr>
                  <th className="px-2 py-1.5">{texts.moderator.monitoring.colTime}</th>

                  <th className="px-2 py-1.5">{texts.moderator.monitoring.colLevel}</th>

                  <th className="px-2 py-1.5">{texts.moderator.monitoring.colType}</th>

                  <th className="px-2 py-1.5">{texts.moderator.monitoring.colMessage}</th>

                  <th className="px-2 py-1.5">{texts.moderator.monitoring.colHttp}</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "danger" | "warn" }) {
  return (
    <div className="min-w-0 rounded-xl border border-border-soft bg-surface-card p-3">
      <p className="truncate text-[10px] uppercase tracking-wide text-text-subtle">{label}</p>

      <p
        className={cn(
          "mt-1 truncate text-lg font-semibold tabular-nums",
          tone === "danger"
            ? "text-destructive"
            : tone === "warn"
              ? "text-amber-600 dark:text-amber-400"
              : "text-text-strong",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-3 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function TrafficChart({ series }: { series: MonitoringMinutePoint[] }) {
  const width = 600;
  const height = 120;
  const max = Math.max(
    1,
    ...series.map((point) => Math.max(point.requests, point.errors4xx + point.errors5xx)),
  );
  const step = width / Math.max(1, series.length - 1);

  const line = (value: (point: MonitoringMinutePoint) => number) =>
    series
      .map((point, index) => `${index * step},${height - (value(point) / max) * (height - 8)}`)
      .join(" ");

  const requestArea = `M0,${height} L${line((point) => point.requests).replaceAll(" ", " L")} L${width},${height} Z`;
  const errorLine = line((point) => point.errors4xx + point.errors5xx);

  return (
    <div className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-32 w-full"
        role="img"
        aria-label={texts.moderator.monitoring.chartTitle}
      >
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={height * fraction}
            y2={height * fraction}
            stroke="var(--border)"
            strokeDasharray="3 4"
            strokeWidth={0.5}
          />
        ))}

        <path d={requestArea} fill="var(--primary)" opacity={0.12} />
        <polyline
          points={line((point) => point.requests)}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2}
        />
        <polyline points={errorLine} fill="none" stroke="var(--destructive)" strokeWidth={1.5} />
      </svg>

      <div className="flex justify-between text-[10px] text-text-subtle">
        <span>{texts.moderator.monitoring.last30}</span>

        <span>
          {texts.moderator.monitoring.peak}: {number.format(max)}
        </span>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: MonitoringEvent }) {
  return (
    <tr className="border-t border-border-soft align-top">
      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px] text-text-subtle">
        {new Date(event.createdAt).toLocaleTimeString("pt-BR", { hour12: false })}
      </td>

      <td className="px-2 py-1.5">
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            LEVEL_CLASS[event.level],
          )}
        >
          {event.level}
        </span>
      </td>

      <td className="whitespace-nowrap px-2 py-1.5 text-[10px] text-text-subtle">{event.type}</td>

      <td className="max-w-[20rem] px-2 py-1.5">
        <p className="break-words text-text-strong">{event.message}</p>

        {event.requestId && (
          <p className="mt-0.5 truncate font-mono text-[9px] text-text-subtle">
            req {event.requestId}
            {event.userId ? ` · ${event.userId}` : ""}
          </p>
        )}
      </td>

      <td className="whitespace-nowrap px-2 py-1.5 font-mono text-[10px] text-text-subtle">
        {event.status
          ? `${event.method ?? ""} ${event.route ?? event.path ?? ""} · ${event.status}`
          : "—"}
        {event.durationMs != null ? ` · ${event.durationMs}ms` : ""}
      </td>
    </tr>
  );
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
