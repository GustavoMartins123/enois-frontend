import type { GamePlayerAction } from "@/types/application/games/game-player-action";
import type { GamePlayerState } from "@/types/application/games/game-player-state";
import { describe, expect, it } from "vitest";

import { initialPlayerState, playerReducer } from "./game-player-state";

const run = (...actions: GamePlayerAction[]): GamePlayerState =>
  actions.reduce(playerReducer, initialPlayerState);

describe("playerReducer", () => {
  it("começa parado e só carrega quando a pessoa aperta Jogar", () => {
    expect(initialPlayerState.status).toBe("idle");
    expect(run({ type: "start" })).toMatchObject({ status: "loading", session: 1 });
  });

  it("ignora tudo antes de começar", () => {
    for (const action of [
      { type: "frame-loaded" },
      { type: "slow" },
      { type: "loading", progress: 50 },
      { type: "ready" },
      { type: "error", message: "x" },
    ] as GamePlayerAction[]) {
      expect(run(action)).toBe(initialPlayerState);
    }
  });

  it("jogo integrado: loading com progresso, depois ready", () => {
    const loading = run({ type: "start" }, { type: "loading", progress: 65 });
    expect(loading).toMatchObject({ status: "loading", progress: 65, integrated: true });

    const loaded = playerReducer(loading, { type: "frame-loaded" });
    expect(loaded.status).toBe("loading");

    expect(playerReducer(loaded, { type: "ready" })).toMatchObject({ status: "ready" });
  });

  it("loading sem progresso mantém o último progresso conhecido", () => {
    const state = run(
      { type: "start" },
      { type: "loading", progress: 40 },
      { type: "loading", progress: null },
    );
    expect(state.progress).toBe(40);
  });

  it("jogo sem protocolo termina em unverified, nunca em erro", () => {
    const state = run({ type: "start" }, { type: "frame-loaded" });
    expect(state.status).toBe("unverified");
    expect(state.errorMessage).toBeNull();
  });

  it("jogo que começa a falar depois do load sai de unverified", () => {
    const state = run(
      { type: "start" },
      { type: "frame-loaded" },
      { type: "loading", progress: 10 },
    );
    expect(state.status).toBe("loading");
    expect(playerReducer(state, { type: "ready" }).status).toBe("ready");
  });

  it("carregamento demorado só muda o aviso", () => {
    const integrado = run({ type: "start" }, { type: "loading", progress: 5 }, { type: "slow" });
    expect(integrado).toMatchObject({ status: "loading", slow: true, session: 1 });

    const semProtocolo = run({ type: "start" }, { type: "slow" });
    expect(semProtocolo).toMatchObject({ status: "unverified", slow: true, session: 1 });
  });

  it("ready depois do aviso de demora limpa o aviso", () => {
    const state = run({ type: "start" }, { type: "loading", progress: 5 }, { type: "slow" });
    expect(playerReducer(state, { type: "ready" })).toMatchObject({ status: "ready", slow: false });
  });

  it("o tempo esgotado depois de pronto não muda nada", () => {
    const ready = run({ type: "start" }, { type: "ready" });
    expect(playerReducer(ready, { type: "slow" })).toBe(ready);
  });

  it("mensagens duplicadas não geram estado novo", () => {
    const ready = run({ type: "start" }, { type: "ready" });
    expect(playerReducer(ready, { type: "ready" })).toBe(ready);

    const error = run({ type: "start" }, { type: "error", message: "falhou" });
    expect(playerReducer(error, { type: "error", message: "falhou" })).toBe(error);
  });

  it("loading atrasado não desfaz ready nem error", () => {
    const ready = run({ type: "start" }, { type: "ready" });
    expect(playerReducer(ready, { type: "loading", progress: 30 })).toBe(ready);

    const error = run({ type: "start" }, { type: "error", message: null });
    expect(playerReducer(error, { type: "loading", progress: 30 })).toBe(error);
  });

  it("erro do jogo vale mesmo depois de pronto (ex.: contexto WebGL perdido)", () => {
    const state = run({ type: "start" }, { type: "ready" }, { type: "error", message: "GPU" });
    expect(state).toMatchObject({ status: "error", errorMessage: "GPU" });
  });

  it("jogo que se recupera do erro volta a pronto", () => {
    const state = run({ type: "start" }, { type: "error", message: "x" }, { type: "ready" });
    expect(state).toMatchObject({ status: "ready", errorMessage: null });
  });

  it("tentar de novo abre uma sessão nova e zera o estado", () => {
    const failed = run(
      { type: "start" },
      { type: "loading", progress: 80 },
      {
        type: "error",
        message: "x",
      },
    );
    const retry = playerReducer(failed, { type: "start" });
    expect(retry).toEqual({ ...initialPlayerState, status: "loading", session: 2 });
  });
});
