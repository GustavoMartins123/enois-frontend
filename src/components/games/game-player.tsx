import {
  type CSSProperties,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { texts } from "@/texts";
import type { GamePlayerProps } from "@/types/components/games/game-player-props";
import { ExternalLink, Gamepad2, Loader2, Maximize2, MoveVertical, RotateCcw } from "lucide-react";

import { SLOW_LOADING_MS, initialPlayerState, playerReducer } from "@/lib/games/game-player-state";
import {
  frameSandbox,
  gameOrigin,
  identityReply,
  isFromGameFrame,
  parseGameMessage,
} from "@/lib/games/game-protocol";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const subscribeNothing = () => () => {};
const MOBILE_HINT_MS = 3000;

const ASPECT: Record<string, string> = {
  WIDESCREEN: "16 / 9",
  CLASSIC: "4 / 3",
  SQUARE: "1 / 1",
  PORTRAIT: "9 / 16",
};

export function GamePlayer({
  url,
  title,
  aspect,
  playable = true,
  autoStart = false,
  tallOnMobile = false,
  identity,
  stats,
  onStart,
  onShareRequest,
  onSpendRequest,
}: GamePlayerProps) {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(playerReducer, autoStart && playable, (start) =>
    start ? playerReducer(initialPlayerState, { type: "start" }) : initialPlayerState,
  );
  const container = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const identityPending = useRef(false);
  const [showMobileHint, setShowMobileHint] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const latest = useRef({ identity, onShareRequest, onSpendRequest });
  // No servidor (e na hidratação) o quadro não existe: o sandbox depende da origem do Énóis, que só
  // o navegador conhece.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const origin = gameOrigin(url);
  const started = state.status !== "idle";
  const session = state.session;
  const t = texts.games.game;

  useEffect(() => {
    latest.current = { identity, onShareRequest, onSpendRequest };
  });

  useEffect(() => {
    if (!started || !origin || !hydrated) return;

    const listener = (event: MessageEvent) => {
      const frameWindow = frame.current?.contentWindow;
      if (!frameWindow || !isFromGameFrame(event, origin, frameWindow)) return;
      const message = parseGameMessage(event.data);
      if (!message) return;

      const handlers = latest.current;
      switch (message.type) {
        case "enois:loading":
          dispatch({ type: "loading", progress: message.progress });
          break;
        case "enois:ready":
          dispatch({ type: "ready" });
          break;
        case "enois:error":
          dispatch({ type: "error", message: message.message });
          break;
        case "enois:identity":
          if (handlers.identity === undefined) break;
          if (handlers.identity?.session === session) {
            frameWindow.postMessage(identityReply(handlers.identity.token), origin);
          } else {
            identityPending.current = true;
          }
          break;
        case "enois:share":
          handlers.onShareRequest?.({ texto: message.texto, imagem: message.imagem }, session);
          break;
        case "enois:spend":
          handlers.onSpendRequest?.(
            { amount: message.amount, motivo: message.motivo, requestId: message.requestId },
            session,
          );
          break;
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [started, origin, hydrated, session]);

  // O jogo pode pedir a identidade antes de o token chegar do servidor.
  useEffect(() => {
    const frameWindow = frame.current?.contentWindow;
    if (!identity || identity.session !== session || !origin || !frameWindow) return;
    if (!identityPending.current) return;
    identityPending.current = false;
    frameWindow.postMessage(identityReply(identity.token), origin);
  }, [identity, session, origin]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowMobileHint(false), MOBILE_HINT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.session === 0) return;
    const timer = window.setTimeout(() => dispatch({ type: "slow" }), SLOW_LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [state.session]);

  const focusFrame = useCallback(() => {
    const active = document.activeElement;
    if (active && active !== document.body && !container.current?.contains(active)) return;
    frame.current?.focus();
  }, []);

  useEffect(() => {
    if (state.status === "ready") focusFrame();
  }, [state.status, focusFrame]);

  const start = (retry: boolean) => {
    identityPending.current = false;
    dispatch({ type: "start" });
    onStart?.(retry, session + 1);
  };

  const enterFullscreen = () => {
    const element = frame.current as
      (HTMLIFrameElement & { webkitRequestFullscreen?: () => void }) | null;
    if (!element) return;
    const unavailable = () => toast(t.player.fullscreenUnavailable, "error");
    if (element.requestFullscreen) {
      element
        .requestFullscreen()
        .then(() => element.focus())
        .catch(unavailable);
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
      element.focus();
    } else {
      unavailable();
    }
  };

  return (
    <div
      ref={container}
      data-status={state.status}
      data-expanded={expanded}
      className="overflow-hidden rounded-2xl border border-border-soft bg-surface-card"
    >
      {/* No celular o 16:9 deixa o quadro com ~200px e o menu do jogo sai da tela. */}
      <div
        ref={viewport}
        className={cn(
          "relative w-full",
          expanded
            ? "aspect-[var(--game-aspect)] max-sm:min-h-[calc(100dvh-8rem)] max-sm:max-h-[calc(100dvh-8rem)] max-sm:resize-none sm:min-h-[max(80svh,48rem)] sm:resize-y overflow-hidden"
            : tallOnMobile
              ? "max-sm:h-[70svh] max-sm:min-h-80 sm:aspect-[var(--game-aspect)]"
              : "aspect-[var(--game-aspect)]",
        )}
        style={{ "--game-aspect": ASPECT[aspect ?? ""] ?? "16 / 9" } as CSSProperties}
      >
        {started && origin && hydrated ? (
          <iframe
            key={state.session}
            ref={frame}
            src={url}
            title={title}
            className="h-full w-full border-0"
            allow="fullscreen; gamepad; autoplay"
            allowFullScreen
            sandbox={frameSandbox(origin, window.location.origin)}
            referrerPolicy="no-referrer"
            onLoad={() => {
              dispatch({ type: "frame-loaded" });
              focusFrame();
            }}
          />
        ) : started && origin ? (
          <div className="h-full w-full bg-primary-soft" />
        ) : (
          <button
            type="button"
            className="grid h-full w-full place-items-center bg-primary-soft text-center"
            disabled={!playable || !origin}
            onClick={() => start(false)}
          >
            <span>
              <Gamepad2 className="mx-auto h-10 w-10 text-primary-text" />

              <span className="mt-2 block text-sm font-medium text-primary-text">
                {origin ? t.play : t.player.unsupportedUrl}
              </span>

              <span className="mt-1 block text-xs text-primary-text">{t.external}</span>
            </span>
          </button>
        )}
      </div>

      {expanded && (
        <p className="hidden border-t border-border-soft px-3 py-2 text-xs text-text-subtle sm:block">
          {t.resizeHint}
        </p>
      )}

      <div aria-live="polite">
        {state.status === "loading" && (
          <div className="space-y-1.5 border-t border-border-soft px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs text-text-subtle">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />

              <>{state.progress === null ? t.loading : t.player.loadingProgress(state.progress)}</>
            </p>

            {state.progress !== null && (
              <div
                role="progressbar"
                aria-label={t.player.progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={state.progress}
                className="h-1 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full bg-primary transition-[width]"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
            )}

            {state.slow && <p className="text-xs text-text-subtle">{t.player.slow}</p>}
          </div>
        )}

        {state.status === "unverified" && (
          <p className="border-t border-border-soft px-3 py-2 text-xs text-text-subtle">
            {t.player.unverified}
          </p>
        )}

        {state.status === "ready" && <p className="sr-only">{t.player.ready}</p>}

        {state.status === "error" && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft bg-destructive/10 px-3 py-2"
          >
            <p className="text-sm text-destructive">
              {state.errorMessage ? t.player.errorDetail(state.errorMessage) : t.player.error}
            </p>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => start(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />

              <>{t.retry}</>
            </Button>
          </div>
        )}
      </div>

      {tallOnMobile && showMobileHint && (
        <p className="border-t border-border-soft px-3 py-2 text-xs text-text-subtle sm:hidden">
          {t.mobileHint}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft px-3 py-2">
        <div className="text-xs text-text-subtle">{stats}</div>

        <div className="flex flex-wrap gap-1.5">
          {started && state.status !== "error" && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => start(true)}
            >
              <RotateCcw className="h-3.5 w-3.5" />

              <>{t.retry}</>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-xs"
            disabled={!started}
            aria-pressed={expanded}
            onClick={() => {
              // Limpa a altura escrita pelo resize nativo sem desmontar o iframe.
              if (expanded) viewport.current?.style.removeProperty("height");
              setExpanded((current) => !current);
            }}
          >
            <MoveVertical className="h-3.5 w-3.5" />

            <>{expanded ? t.restoreWindow : t.expandWindow}</>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-xs"
            disabled={!started}
            onClick={enterFullscreen}
          >
            <Maximize2 className="h-3.5 w-3.5" />

            <>{t.fullscreen}</>
          </Button>

          {origin && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-subtle transition hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />

              <>{t.openAtOrigin}</>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
