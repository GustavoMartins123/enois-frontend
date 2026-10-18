import { useQuery } from "@tanstack/react-query";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ExternalLink, Maximize2, ShieldAlert } from "lucide-react";

import { gamesApi } from "@/lib/api";

import { AppContainer } from "@/components/app-container";

export const Route = createFileRoute("/games/$username/$gameSlug")({
  head: ({ params }) => ({ meta: [{ title: `${params.gameSlug} · Jogos · Énóis` }] }),
  component: GamePage,
});

/**
 * O jogo embutido (Parte E): o Énóis NÃO hospeda — o quadro carrega o jogo do lugar
 * onde o criador o publicou. O sandbox deixa scripts rodar, mas sem popups livres e
 * sem formulários; a tela cheia é explícita (allow="fullscreen" + botão).
 */
function GamePage() {
  const { username, gameSlug } = Route.useParams();
  const game = useQuery({
    queryKey: ["games", "slug", username, gameSlug],
    queryFn: () => gamesApi.bySlug(username, gameSlug),
  });
  const frame = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  if (game.isLoading) {
    return (
      <AppContainer>
        <p className="py-10 text-center text-sm text-text-subtle">Carregando…</p>
      </AppContainer>
    );
  }

  if (game.isError || !game.data) {
    return (
      <AppContainer>
        <p className="py-10 text-center text-sm text-text-subtle">Jogo não encontrado.</p>
      </AppContainer>
    );
  }

  const g = game.data;

  return (
    <AppContainer>
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-sm text-text-subtle">
          <Link to="/games" className="hover:underline">
            Jogos
          </Link>
          {" / "}
          <Link to="/games/$username" params={{ username }} className="hover:underline">
            {username}
          </Link>
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{g.title}</h1>
        {g.description && <p className="mt-1 text-sm text-text-subtle">{g.description}</p>}

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border-soft bg-surface-card">
          {playing ? (
            <iframe
              ref={frame}
              src={g.url}
              title={g.title}
              className="aspect-video w-full"
              allow="fullscreen; gamepad; autoplay"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
              referrerPolicy="no-referrer"
            />
          ) : (
            <button
              type="button"
              className="grid aspect-video w-full place-items-center bg-primary-soft"
              onClick={() => setPlaying(true)}
            >
              <span className="text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-text shadow-soft">
                  ▶
                </span>
                <span className="mt-3 block text-sm font-medium">Jogar (carrega o jogo de {host(g.url)})</span>
              </span>
            </button>
          )}

          {playing && (
            <button
              type="button"
              aria-label="Tela cheia"
              className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"
              onClick={() => frame.current?.requestFullscreen?.()}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-text-subtle">
            <ShieldAlert className="h-3.5 w-3.5" />
            O jogo roda fora do Énóis, num quadro isolado.
          </p>
          <a
            href={g.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir em nova aba
          </a>
        </div>

        {g.tags && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {g.tags.split(",").map((t) => (
              <li key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-subtle">
                {t.trim()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppContainer>
  );
}

function host(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}
