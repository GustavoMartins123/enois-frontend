import type { GamePlayerAction } from "@/types/application/games/game-player-action";
import type { GamePlayerState } from "@/types/application/games/game-player-state";

/** Só troca o aviso: Unity WebGL no celular passa disso fácil, e o quadro continua montado. */
export const SLOW_LOADING_MS = 20_000;

export const initialPlayerState: GamePlayerState = {
  status: "idle",
  session: 0,
  progress: null,
  errorMessage: null,
  integrated: false,
  slow: false,
};

/**
 * O `load` do iframe não prova que o jogo iniciou (a página que recusa quadro também dispara load)
 * e silêncio não prova falha: sem mensagem do jogo o máximo é `unverified`.
 */
export function playerReducer(state: GamePlayerState, action: GamePlayerAction): GamePlayerState {
  if (action.type === "start") {
    return { ...initialPlayerState, status: "loading", session: state.session + 1 };
  }
  if (state.status === "idle") return state;

  switch (action.type) {
    case "frame-loaded":
      return state.status === "loading" && !state.integrated
        ? { ...state, status: "unverified" }
        : state;

    case "slow":
      if (state.status !== "loading") return state;
      return { ...state, slow: true, status: state.integrated ? "loading" : "unverified" };

    case "loading":
      if (state.status === "ready" || state.status === "error") return state;
      return {
        ...state,
        status: "loading",
        integrated: true,
        progress: action.progress ?? state.progress,
      };

    case "ready":
      if (state.status === "ready") return state;
      return { ...state, status: "ready", integrated: true, errorMessage: null, slow: false };

    case "error":
      if (state.status === "error" && state.errorMessage === action.message) return state;
      return { ...state, status: "error", integrated: true, errorMessage: action.message };

    default:
      return state;
  }
}
