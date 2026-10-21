import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { texts } from "@/texts";

import { gamesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const WINDOWS = [7, 30, 90] as const;

/**
 * Os números de uso do jogo, só para o criador: totais (sessões, pessoas distintas, biblioteca e
 * novidades) e a série diária em barras. O gráfico é feito com divs — sem biblioteca nova por um
 * gráfico de barras, e o tema já pinta as barras.
 *
 * A série sempre cobre a janela inteira (dia sem evento aparece com zero) — o eixo não muda de
 * tamanho conforme o uso, senão dois dias parados pareciam dois dias ruins.
 */
export function GameAnalyticsCard({ gameId }: { gameId: string }) {
  const [days, setDays] = useState<number>(30);

  const analytics = useQuery({
    queryKey: ["games", "analytics", gameId, days],
    queryFn: () => gamesApi.analytics(gameId, days),
  });

  const data = analytics.data;
  const max = Math.max(1, ...(data?.series ?? []).map((day) => day.pageViews));
  const totalViews = (data?.series ?? []).reduce((sum, day) => sum + day.pageViews, 0);

  return (
    <div className="rounded-xl border border-border-soft p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-text-strong">
          {texts.games.panel.analyticsGroup.title}
        </h3>

        <div className="flex gap-1">
          {WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDays(window)}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs transition",
                days === window
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-text-subtle hover:bg-muted",
              )}
            >
              {window}d
            </button>
          ))}
        </div>
      </div>

      {analytics.isLoading ? (
        <p className="mt-2 text-xs text-text-subtle">{texts.common.loading}</p>
      ) : analytics.isError ? (
        <p className="mt-2 text-xs text-destructive">{texts.games.panel.analyticsGroup.error}</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={texts.games.panel.analyticsGroup.plays} value={data?.plays ?? 0} />
            <Stat label={texts.games.panel.analyticsGroup.players} value={data?.players ?? 0} />
            <Stat label={texts.games.panel.analyticsGroup.favorites} value={data?.favorites ?? 0} />
            <Stat label={texts.games.panel.analyticsGroup.updates} value={data?.updates ?? 0} />
          </div>

          <div className="mt-3">
            <p className="text-xs text-text-subtle">
              {texts.games.panel.analyticsGroup.views(totalViews, days)}
            </p>

            <div
              className="mt-1 flex h-20 items-end gap-[2px]"
              role="img"
              aria-label={texts.games.panel.analyticsGroup.chartLabel(days)}
            >
              {(data?.series ?? []).map((day) => (
                <div
                  key={day.date}
                  // Dia sem visualização fica com 2px de base: sem isso a barra desaparece e o
                  // eixo parece ter buracos.
                  style={{ height: `${Math.max(2, (day.pageViews / max) * 100)}%` }}
                  className="flex-1 rounded-t bg-primary/60"
                  title={texts.games.panel.analyticsGroup.tooltip(
                    day.date,
                    day.pageViews,
                    day.plays,
                    day.players,
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-1.5">
      <p className="text-xs text-text-subtle">{label}</p>

      <p className="text-sm font-semibold text-text-strong">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}
