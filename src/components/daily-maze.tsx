import { useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Map } from "lucide-react";

import { dailyMazeApi, previousChallengeDate, type MazeDirection } from "@/lib/api/daily-games";
import { randomUUID } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const keys: Record<string, MazeDirection> = { ArrowUp: "UP", ArrowRight: "RIGHT", ArrowDown: "DOWN", ArrowLeft: "LEFT" };
const buttons: { direction: MazeDirection; label: string; symbol: string }[] = [
  { direction: "UP", label: "Mover para cima", symbol: "↑" },
  { direction: "LEFT", label: "Mover para a esquerda", symbol: "←" },
  { direction: "DOWN", label: "Mover para baixo", symbol: "↓" },
  { direction: "RIGHT", label: "Mover para a direita", symbol: "→" },
];

export function DailyMaze() {
  const client = useQueryClient();
  const [showPrevious, setShowPrevious] = useState(false);
  const pending = useRef<{ direction: MazeDirection; requestId: string } | null>(null);
  const today = useQuery({ queryKey: ["daily-games", "maze", "today"], queryFn: () => dailyMazeApi.today() });
  const previousDate = today.data ? previousChallengeDate(today.data.date) : undefined;
  const previous = useQuery({ queryKey: ["daily-games", "maze", "previous", previousDate], queryFn: () => dailyMazeApi.today(previousDate), enabled: Boolean(previousDate) });
  const queryKey = showPrevious ? ["daily-games", "maze", "previous", previousDate] : ["daily-games", "maze", "today"];
  const ranking = useQuery({ queryKey: ["daily-games", "maze", "leaderboard"], queryFn: dailyMazeApi.leaderboard });
  const start = useMutation({ mutationFn: dailyMazeApi.start, onSuccess: (data) => client.setQueryData(queryKey, data), onError: () => { void today.refetch(); } });
  const move = useMutation({
    mutationFn: ({ direction, requestId }: { direction: MazeDirection; requestId: string }) => dailyMazeApi.move(direction, requestId, showPrevious ? previousDate : undefined),
    onSuccess: (data) => {
      pending.current = null;
      client.setQueryData(queryKey, data);
      if (data.status === "WON") void client.invalidateQueries({ queryKey: ["daily-games", "maze", "leaderboard"] });
    },
    onError: () => { void client.invalidateQueries({ queryKey: ["daily-games", "maze"] }); },
  });
  function attempt(direction: MazeDirection) {
    if ((showPrevious ? previous.data : today.data)?.status !== "IN_PROGRESS" || move.isPending) return;
    if (!pending.current || pending.current.direction !== direction) pending.current = { direction, requestId: randomUUID() };
    move.mutate(pending.current);
  }
  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    const direction = keys[event.key];
    if (!direction) return;
    event.preventDefault();
    attempt(direction);
  }
  const state = showPrevious ? previous.data : today.data;
  return <section className="surface-card p-5 sm:p-6" aria-labelledby="maze-title">
    <h2 id="maze-title" className="flex items-center gap-2 text-xl font-semibold"><Map className="h-5 w-5" /> Labirinto</h2>
    <p className="mt-1 text-sm text-muted-foreground">Encontre a saída. Use as setas do teclado ou os botões abaixo.</p>
    {today.isPending && <p className="mt-4" role="status">Carregando desafio…</p>}
    {today.isError && <p className="mt-4" role="alert">Não foi possível carregar o labirinto. <button className="text-primary underline" onClick={() => void today.refetch()}>Tentar novamente</button></p>}
    {(previous.data?.status === "IN_PROGRESS" || showPrevious) && <Button className="mt-4" variant="outline" onClick={() => { pending.current = null; setShowPrevious(!showPrevious); }}>{showPrevious ? "Voltar ao desafio de hoje" : "Retomar desafio de ontem"}</Button>}
    {state && <div className="mt-4 space-y-4">
      <p className="text-sm text-muted-foreground">Desafio de {state.date} · {state.moves} movimentos</p>
      {state.status === "NOT_STARTED" && <div><Button onClick={() => start.mutate()} disabled={start.isPending}>{start.isPending ? "Iniciando…" : "Começar desafio"}</Button>{start.isError && <p className="mt-2 text-sm text-destructive" role="alert">Não foi possível iniciar o desafio.</p>}</div>}
      {state.passages && <div tabIndex={0} onKeyDown={onKey} role="application" aria-label={`Labirinto, coluna ${state.position % 9 + 1}, linha ${Math.floor(state.position / 9) + 1}. A saída está na coluna 9, linha 9. Use as setas para mover.`} className="grid aspect-square w-full max-w-sm grid-cols-9 outline-primary focus-visible:outline focus-visible:outline-2">
        {state.passages.map((cell, i) => <div key={i} aria-hidden="true" className="relative grid place-items-center" style={{ borderTop: cell & 1 ? "1px solid transparent" : "2px solid currentColor", borderRight: cell & 2 ? "1px solid transparent" : "2px solid currentColor", borderBottom: cell & 4 ? "1px solid transparent" : "2px solid currentColor", borderLeft: cell & 8 ? "1px solid transparent" : "2px solid currentColor" }}>
          {i === 80 && <span className="text-xs font-bold text-primary">F</span>}{i === state.position && <span className="absolute h-3 w-3 rounded-full bg-primary" />}
        </div>)}
      </div>}
      {state.status === "IN_PROGRESS" && <div className="flex flex-wrap gap-2" aria-label="Controles de movimento">{buttons.map((button) => <Button key={button.direction} type="button" variant="outline" aria-label={button.label} disabled={move.isPending} onClick={() => attempt(button.direction)}>{button.symbol}</Button>)}</div>}
      {move.isError && <p role="alert" className="text-sm text-destructive">{move.error instanceof Error ? move.error.message : "Não foi possível mover."}</p>}
      {state.status === "WON" && <p role="status" className="font-medium">Você encontrou a saída em {state.moves} movimentos!</p>}
    </div>}
    <h3 className="mt-5 font-semibold">Ranking de hoje</h3>
    {ranking.isPending && <p className="mt-2 text-sm">Carregando ranking…</p>}
    {ranking.isError && <p className="mt-2 text-sm" role="alert">Não foi possível carregar o ranking. <button className="text-primary underline" onClick={() => void ranking.refetch()}>Tentar novamente</button></p>}
    {ranking.data && (ranking.data.items.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Ainda não há resultados.</p> : <ol className="mt-2 divide-y divide-border">{ranking.data.items.map((item, i) => <li key={item.username} className="flex justify-between gap-2 py-2 text-sm"><span>{i + 1}. <Link to="/perfil/$username" params={{ username: item.username }} className="text-primary underline">{item.name}</Link></span><span>{(item.elapsedMillis / 1000).toFixed(1)} s · {item.moves} movimentos</span></li>)}</ol>)}
  </section>;
}



