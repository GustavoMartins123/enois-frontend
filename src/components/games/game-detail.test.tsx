// @vitest-environment node
import type { QueryClient } from "@tanstack/react-query";

import { texts } from "@/texts";
import type { GameView } from "@/types/application/games/game-view";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { builtinEnvironments } from "vitest/environments";

// Ambiente node com o DOM montado aqui: React, React DOM e TanStack precisam ser a mesma cópia.
await builtinEnvironments.jsdom.setup(globalThis, {
  jsdom: { url: "https://enois.ia.br/games/dev/jogo-a" },
});
window.scrollTo = () => {};
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");
const { QueryClient: QueryClientImpl, QueryClientProvider } = await import("@tanstack/react-query");
const { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } =
  await import("@tanstack/react-router");
const { registerBrowserQueryClient } = await import("@/lib/query-client");
const { storeSession } = await import("@/lib/session");
const { ToastProvider } = await import("@/components/ui/toast");
const { GameDetail } = await import("./game-detail");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const server = vi.hoisted(() => {
  const state = {
    games: {} as Record<string, { id: string; slug: string; url: string; title: string }>,
    favorites: new Map<string, Set<string>>(),
    failFavorite: false,
    pendingIdentity: [] as {
      gameId: string;
      resolve: (token: string) => void;
    }[],
  };
  const token = () => localStorage.getItem("session_token");
  return { state, token };
});

vi.mock("@/lib/api", () => {
  const { state, token } = server;
  const favoritesOf = (gameId: string) =>
    [...state.favorites.values()].filter((set) => set.has(gameId)).length;
  const view = (slug: string) => {
    const game = state.games[slug];
    if (!game) throw new Error("GAME_NOT_FOUND");
    const mine = token() ? state.favorites.get(token()!) : undefined;
    return {
      ...game,
      userId: "u_dev",
      username: "dev",
      status: "PUBLISHED",
      submittedAt: "2026-10-19T00:00:00Z",
      genres: [],
      languages: [],
      stage: "DEMO",
      distribution: "FREE",
      priceCoins: 0,
      aspect: "WIDESCREEN",
      mediaIds: [],
      plays: 0,
      favorites: favoritesOf(game.id),
      owned: false,
      favorited: Boolean(mine?.has(game.id)),
    } satisfies GameView;
  };
  const toggle = async (gameId: string, add: boolean) => {
    if (state.failFavorite) throw new Error("falhou");
    const mine = state.favorites.get(token()!) ?? new Set<string>();
    if (add) mine.add(gameId);
    else mine.delete(gameId);
    state.favorites.set(token()!, mine);
    return { favorited: add, favorites: favoritesOf(gameId) };
  };
  return {
    gamesApi: {
      bySlug: vi.fn(async (_username: string, slug: string) => view(slug)),
      stats: vi.fn(async (gameId: string) => ({
        plays: 0,
        players: 0,
        favorites: favoritesOf(gameId),
        updates: 0,
      })),
      updates: vi.fn(async () => []),
      play: vi.fn(async () => ({ plays: 1 })),
      favorite: vi.fn((gameId: string) => toggle(gameId, true)),
      unfavorite: vi.fn((gameId: string) => toggle(gameId, false)),
      identity: vi.fn(
        (gameId: string) =>
          new Promise((resolve) => {
            state.pendingIdentity.push({
              gameId,
              resolve: (value: string) =>
                resolve({ token: value, expiresAt: "", playerRef: "plr_x" }),
            });
          }),
      ),
      spend: vi.fn(async () => ({ status: "DEBITED" })),
      compartilhar: vi.fn(async () => ({ postId: "p1", status: "SHARED" })),
    },
    mediaApi: { requestUpload: vi.fn(), uploadToSignedUrl: vi.fn() },
    profileApi: {
      me: vi.fn(async () => {
        if (!token()) throw new Error("401");
        return { id: `perfil_${token()}` };
      }),
    },
  };
});

const { gamesApi } = await import("@/lib/api");

let host: HTMLDivElement;
let root: Root;
let queryClient: QueryClient;
let router: ReturnType<typeof makeRouter>;

function makeRouter(path: string) {
  const rootRoute = createRootRoute({ component: Outlet });
  const gameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/games/$username/$gameSlug",
    component: function GameRoute() {
      const { username, gameSlug } = gameRoute.useParams();
      return <GameDetail username={username} gameSlug={gameSlug} />;
    },
  });
  const others = ["/games", "/games/$username", "/entrar"].map((p) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: p,
      component: () => null,
    }),
  );
  return createRouter({
    routeTree: rootRoute.addChildren([gameRoute, ...others]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

async function flush() {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function waitFor(check: () => void, timeout = 2000) {
  const started = Date.now();
  for (;;) {
    try {
      check();
      return;
    } catch (error) {
      if (Date.now() - started > timeout) throw error;
      await flush();
    }
  }
}

async function open(slug: string) {
  router = makeRouter(`/games/dev/${slug}`);
  await act(async () => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>,
    );
  });
  await waitFor(() => expect(host.querySelector("[data-status]")).not.toBeNull());
}

async function navigateTo(slug: string) {
  await act(async () => {
    await router.navigate({
      to: "/games/$username/$gameSlug",
      params: { username: "dev", gameSlug: slug },
    });
  });
  await waitFor(() =>
    expect(document.querySelector("h1")?.textContent).toBe(server.state.games[slug].title),
  );
}

const button = (label: string | RegExp) =>
  [...document.querySelectorAll("button")].find((b) =>
    typeof label === "string" ? b.textContent?.includes(label) : label.test(b.textContent ?? ""),
  );
const dialog = () => document.querySelector('[role="dialog"]');
const frame = () => host.querySelector("iframe")!;

async function startGame() {
  await act(async () => button(texts.games.game.play)!.click());
  await waitFor(() => expect(host.querySelector("iframe")).not.toBeNull());
}

async function fromGame(
  slug: string,
  data: unknown,
  source: Window | null = frame().contentWindow,
) {
  const origin = new URL(server.state.games[slug].url).origin;
  await act(async () => {
    window.dispatchEvent(new MessageEvent("message", { data, origin, source }));
  });
}

beforeEach(() => {
  localStorage.clear();
  server.state.games = {
    "jogo-a": {
      id: "game_a",
      slug: "jogo-a",
      url: "https://jogo-a.exemplo.com/",
      title: "Jogo A",
    },
    "jogo-b": {
      id: "game_b",
      slug: "jogo-b",
      url: "https://jogo-b.exemplo.com/",
      title: "Jogo B",
    },
  };
  server.state.favorites = new Map([["tok_ana", new Set(["game_a"])]]);
  server.state.failFavorite = false;
  server.state.pendingIdentity = [];
  vi.clearAllMocks();
  queryClient = new QueryClientImpl({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
  registerBrowserQueryClient(queryClient);
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  document.body.innerHTML = "";
  queryClient.clear();
});

describe("pedidos do jogo presos ao jogo que os fez", () => {
  it("A: confirmar sem trocar de jogo chama só o endpoint do jogo A", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 5000,
      requestId: "r-a",
    });
    await waitFor(() => expect(dialog()).not.toBeNull());

    await act(async () => button(texts.games.game.spend.confirm)!.click());
    await waitFor(() => expect(gamesApi.spend).toHaveBeenCalledTimes(1));
    expect(gamesApi.spend).toHaveBeenCalledWith("game_a", 5000, "", "r-a");
  });

  it("B: pedido de gasto do jogo A não sobrevive à navegação para o jogo B", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 5000,
      requestId: "r-a",
    });
    await waitFor(() => expect(dialog()).not.toBeNull());

    await navigateTo("jogo-b");
    expect(dialog()).toBeNull();
    expect(button(texts.games.game.spend.confirm)).toBeUndefined();

    await startGame();
    expect(dialog()).toBeNull();
    expect(gamesApi.spend).not.toHaveBeenCalled();
  });

  it("C: compartilhamento do jogo A não é publicado como sendo do B", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", { type: "enois:share", texto: "Conquista do A" });
    await waitFor(() => expect(dialog()?.textContent).toContain("Conquista do A"));

    await navigateTo("jogo-b");
    expect(dialog()).toBeNull();
    await startGame();
    expect(document.body.textContent).not.toContain("Conquista do A");
    expect(gamesApi.compartilhar).not.toHaveBeenCalled();
  });

  it("D: identidade do jogo A que chega depois da navegação não chega ao jogo B", async () => {
    storeSession({ token: "tok_ana" });
    await open("jogo-a");
    await startGame();
    expect(server.state.pendingIdentity.map((p) => p.gameId)).toEqual(["game_a"]);

    await navigateTo("jogo-b");
    await startGame();
    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await fromGame("jogo-b", { type: "enois:identity" });

    await act(async () => server.state.pendingIdentity[0].resolve("tok_do_jogo_a"));
    await flush();
    expect(post).not.toHaveBeenCalled();

    await act(async () => server.state.pendingIdentity[1].resolve("tok_do_jogo_b"));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith(
      { type: "enois:identity", token: "tok_do_jogo_b" },
      "https://jogo-b.exemplo.com",
    );
  });

  it("D: troca de gameId no mesmo endereço tira o pedido aberto da tela", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 5000,
      requestId: "r-a",
    });
    await waitFor(() => expect(dialog()).not.toBeNull());

    server.state.games["jogo-a"] = {
      ...server.state.games["jogo-a"],
      id: "game_a2",
    };
    await act(async () => queryClient.invalidateQueries({ queryKey: ["games", "slug"] }));
    await waitFor(() => expect(dialog()).toBeNull());
    expect(gamesApi.spend).not.toHaveBeenCalled();
  });

  it("E: segundo pedido com o diálogo aberto não substitui o primeiro", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 1000,
      requestId: "r-1",
    });
    await waitFor(() => expect(dialog()?.textContent).toContain("1 faíscas"));
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 999000,
      requestId: "r-2",
    });
    expect(dialog()?.textContent).toContain("1 faíscas");
    expect(dialog()?.textContent).not.toContain("999");

    await act(async () => button(texts.games.game.spend.confirm)!.click());
    await waitFor(() => expect(gamesApi.spend).toHaveBeenCalledTimes(1));
    expect(gamesApi.spend).toHaveBeenCalledWith("game_a", 1000, "", "r-1");
  });

  it("F: recusar e cancelar não chamam endpoint nenhum", async () => {
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", {
      type: "enois:spend",
      amount: 5000,
      requestId: "r-a",
    });
    await waitFor(() => expect(dialog()).not.toBeNull());
    await act(async () => button(texts.games.game.spend.refuse)!.click());
    await waitFor(() => expect(dialog()).toBeNull());

    await fromGame("jogo-a", { type: "enois:share", texto: "oi" });
    await waitFor(() => expect(dialog()).not.toBeNull());
    await act(async () => button(texts.games.game.achievement.cancel)!.click());
    await waitFor(() => expect(dialog()).toBeNull());

    await flush();
    expect(gamesApi.spend).not.toHaveBeenCalled();
    expect(gamesApi.compartilhar).not.toHaveBeenCalled();
  });

  it("G: reiniciar o quadro não reaproveita o token nem o pedido da sessão anterior", async () => {
    storeSession({ token: "tok_ana" });
    await open("jogo-a");
    await startGame();
    await act(async () => server.state.pendingIdentity[0].resolve("tok_sessao_1"));
    await fromGame("jogo-a", { type: "enois:error", version: 1 });
    await act(async () => (host.querySelector('[role="alert"] button') as HTMLElement).click());
    await waitFor(() => expect(server.state.pendingIdentity).toHaveLength(2));

    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await fromGame("jogo-a", { type: "enois:identity" });
    expect(post).not.toHaveBeenCalled();

    await act(async () => server.state.pendingIdentity[1].resolve("tok_sessao_2"));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    expect(post).toHaveBeenCalledWith(
      { type: "enois:identity", token: "tok_sessao_2" },
      "https://jogo-a.exemplo.com",
    );
    expect(gamesApi.play).toHaveBeenCalledTimes(1);
  });

  it("G: token pedido antes do retry e entregue depois é descartado", async () => {
    storeSession({ token: "tok_ana" });
    await open("jogo-a");
    await startGame();
    await fromGame("jogo-a", { type: "enois:error", version: 1 });
    await act(async () => (host.querySelector('[role="alert"] button') as HTMLElement).click());
    await waitFor(() => expect(server.state.pendingIdentity).toHaveLength(2));

    const post = vi.spyOn(frame().contentWindow!, "postMessage");
    await fromGame("jogo-a", { type: "enois:identity" });
    await act(async () => server.state.pendingIdentity[0].resolve("tok_atrasado"));
    await flush();
    expect(post).not.toHaveBeenCalled();
  });
});
