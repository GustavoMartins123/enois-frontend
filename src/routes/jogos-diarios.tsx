import { type FormEvent, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { Gamepad2, Trophy } from "lucide-react";

import { randomUUID } from "@/lib/api-client";
import { type WordMark, dailyWordsApi, previousChallengeDate } from "@/lib/api/daily-games";
import { requireAuth } from "@/lib/require-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AppContainer } from "@/components/app-container";
import { DailyBlocks } from "@/components/daily-blocks";
import { DailyMaze } from "@/components/daily-maze";

export const Route = createFileRoute("/jogos-diarios")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Jogos diários · Énóis" }] }),
  component: DailyGames,
});

const markLabels: Record<WordMark, string> = {
  CORRECT: "letra na posição correta",
  PRESENT: "letra em outra posição",
  ABSENT: "letra ausente",
};
const markStyles: Record<WordMark, string> = {
  CORRECT: "border-emerald-700 bg-emerald-700 text-white",
  PRESENT: "border-amber-700 bg-amber-700 text-white",
  ABSENT: "border-slate-600 bg-slate-600 text-white",
};

function DailyGames() {
  const queryClient = useQueryClient();
  const [guess, setGuess] = useState("");
  const pendingRequest = useRef<{ word: string; requestId: string } | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  const [showPrevious, setShowPrevious] = useState(false);
  const today = useQuery({
    queryKey: ["daily-games", "words", "today"],
    queryFn: () => dailyWordsApi.today(),
  });
  const previousDate = today.data ? previousChallengeDate(today.data.date) : undefined;
  const previous = useQuery({
    queryKey: ["daily-games", "words", "previous", previousDate],
    queryFn: () => dailyWordsApi.today(previousDate),
    enabled: Boolean(previousDate),
  });
  const ranking = useQuery({
    queryKey: ["daily-games", "words", "leaderboard"],
    queryFn: dailyWordsApi.leaderboard,
  });
  const submit = useMutation({
    mutationFn: ({ word, requestId }: { word: string; requestId: string }) =>
      dailyWordsApi.guess(word, requestId, showPrevious ? previousDate : undefined),
    onSuccess: (state) => {
      queryClient.setQueryData(
        showPrevious
          ? ["daily-games", "words", "previous", previousDate]
          : ["daily-games", "words", "today"],
        state,
      );
      void queryClient.invalidateQueries({ queryKey: ["daily-games", "words", "leaderboard"] });
      pendingRequest.current = null;
      setGuess("");
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["daily-games", "words"] });
    },
  });
  const start = useMutation({
    mutationFn: dailyWordsApi.start,
    onSuccess: (state) => queryClient.setQueryData(["daily-games", "words", "today"], state),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ["daily-games", "words"] });
    },
  });
  const state = showPrevious ? previous.data : today.data;
  const finished = state?.status === "WON" || state?.status === "LOST";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!state || finished || submit.isPending) return;
    const word = guess.trim().toLocaleUpperCase("pt-BR");
    if (!pendingRequest.current || pendingRequest.current.word !== word) {
      pendingRequest.current = { word, requestId: randomUUID() };
    }
    submit.mutate(pendingRequest.current);
  }

  async function share() {
    if (!state || !finished) return;
    const result = state.status === "WON" ? `${state.guesses.length}/6` : "não concluído";
    const text = `Palavras do Énóis · ${state.date}\nResultado: ${result}\n${window.location.origin}/jogos-diarios`;
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setShareMessage("Resultado copiado para a área de transferência.");
      }
    } catch {
      setShareMessage("Não foi possível compartilhar. Tente novamente.");
    }
  }

  return (
    <AppContainer>
      <main className="mx-auto max-w-4xl space-y-6">
        <header className="surface-card p-5 sm:p-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Gamepad2 className="h-6 w-6 text-primary" /> Jogos diários
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Um desafio por dia para fazer uma pausa e jogar com a comunidade.
          </p>

          <Link
            to="/games"
            className="mt-3 inline-block text-sm font-medium text-primary underline"
          >
            Explorar jogos da comunidade
          </Link>
        </header>

        <section className="surface-card p-5 sm:p-6" aria-labelledby="words-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="words-title" className="text-xl font-semibold">
                Palavras
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Descubra a palavra de cinco letras em até seis tentativas.
              </p>
            </div>
            {state && (
              <p className="text-sm text-muted-foreground">
                Sequência: {state.streak} {state.streak === 1 ? "dia" : "dias"}
              </p>
            )}
          </div>
          {today.isPending && (
            <p className="mt-5" role="status">
              Carregando desafio…
            </p>
          )}
          {today.isError && (
            <div className="mt-5" role="alert">
              <p>Não foi possível carregar o desafio.</p>

              <Button className="mt-2" variant="outline" onClick={() => void today.refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}
          {(previous.data?.status === "IN_PROGRESS" || showPrevious) && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                pendingRequest.current = null;
                setShowPrevious(!showPrevious);
              }}
            >
              {showPrevious ? "Voltar ao desafio de hoje" : "Retomar desafio de ontem"}
            </Button>
          )}
          {state && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Desafio de {state.date} · reinicia à meia-noite em São Paulo
              </p>

              <div className="space-y-2" aria-label="Tentativas anteriores">
                {state.guesses.map((row, index) => (
                  <div
                    key={`${index}-${row.word}`}
                    className="flex gap-1.5"
                    aria-label={`Tentativa ${index + 1}: ${Array.from(row.word)
                      .map((letter, i) => `${letter}, ${markLabels[row.marks[i]]}`)
                      .join("; ")}`}
                  >
                    {Array.from(row.word).map((letter, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className={`grid h-11 w-11 place-items-center rounded border text-lg font-bold ${markStyles[row.marks[i]]}`}
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                ))}
                {state.guesses.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma tentativa ainda.</p>
                )}
              </div>
              {state.status === "NOT_STARTED" && (
                <div>
                  <Button onClick={() => start.mutate()} disabled={start.isPending}>
                    {start.isPending ? "Iniciando…" : "Começar desafio"}
                  </Button>
                  {start.isError && (
                    <p role="alert" className="mt-2 text-sm text-destructive">
                      Não foi possível iniciar o desafio. Tente novamente.
                    </p>
                  )}
                </div>
              )}
              {state.status === "IN_PROGRESS" && (
                <form onSubmit={handleSubmit} className="flex max-w-sm flex-wrap gap-2">
                  <label htmlFor="word-guess" className="sr-only">
                    Palavra de cinco letras
                  </label>

                  <Input
                    id="word-guess"
                    className="w-40 uppercase"
                    value={guess}
                    onChange={(event) => setGuess(event.target.value)}
                    minLength={5}
                    maxLength={5}
                    autoComplete="off"
                    required
                    disabled={submit.isPending}
                  />

                  <Button type="submit" disabled={submit.isPending || guess.trim().length !== 5}>
                    {submit.isPending ? "Enviando…" : "Enviar"}
                  </Button>
                </form>
              )}
              {submit.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {submit.error instanceof Error
                    ? submit.error.message
                    : "Não foi possível enviar a tentativa."}
                </p>
              )}
              {finished && (
                <div role="status" className="space-y-3">
                  <p className="font-medium">
                    {state.status === "WON"
                      ? `Você descobriu em ${state.guesses.length} ${state.guesses.length === 1 ? "tentativa" : "tentativas"}!`
                      : "As tentativas de hoje terminaram."}
                  </p>

                  <Button variant="outline" onClick={() => void share()}>
                    Compartilhar resultado
                  </Button>
                  {shareMessage && <p className="text-sm">{shareMessage}</p>}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Verde: posição correta · amarelo: outra posição · cinza: letra ausente.
              </p>
            </div>
          )}
        </section>

        <section className="surface-card p-5 sm:p-6" aria-labelledby="ranking-title">
          <h2 id="ranking-title" className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5" /> Ranking de palavras
          </h2>
          {ranking.isPending && (
            <p className="mt-3 text-sm" role="status">
              Carregando ranking…
            </p>
          )}
          {ranking.isError && (
            <p className="mt-3 text-sm" role="alert">
              Não foi possível carregar o ranking.{" "}
              <button className="text-primary underline" onClick={() => void ranking.refetch()}>
                Tentar novamente
              </button>
            </p>
          )}
          {ranking.data &&
            (ranking.data.items.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Ainda não há resultados.</p>
            ) : (
              <ol className="mt-3 divide-y divide-border">
                {ranking.data.items.map((entry, index) => (
                  <li
                    key={entry.username}
                    className="flex items-center justify-between gap-2 py-2 text-sm"
                  >
                    <span>
                      {index + 1}.{" "}
                      <Link
                        to="/perfil/$username"
                        params={{ username: entry.username }}
                        className="font-medium text-primary underline"
                      >
                        {entry.name}
                      </Link>
                    </span>

                    <span>
                      {entry.attempts} {entry.attempts === 1 ? "tentativa" : "tentativas"}
                    </span>
                  </li>
                ))}
              </ol>
            ))}
        </section>

        <DailyMaze />
        <DailyBlocks />
      </main>
    </AppContainer>
  );
}
