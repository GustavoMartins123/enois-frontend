// @vitest-environment jsdom
import { act } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { usePostCardStore } from "@/stores/post-card.store";
import type { PostView } from "@/types/application/feed/post-view";
import type { ActionResponse } from "@/types/application/reaction/action-response";
import type { UsePostReactionResult } from "@/types/lib/reactions/use-post-reaction-result";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePostReaction } from "./use-post-reaction";

const mocks = vi.hoisted(() => ({
  react: vi.fn(),
  removeReaction: vi.fn(),
  listReactions: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/lib/api", () => ({ ApiError: Error, reactionsApi: mocks }));
vi.mock("@/lib/use-auth", () => ({
  useAuth: () => ({ requireAuth: () => true, user: { id: "viewer" } }),
}));
vi.mock("@/components/ui/toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));

const post: PostView = {
  id: "post-reaction-race",
  authorId: "another-user",
  authorUsername: "demo",
  authorName: "Perfil de demonstração",
  authorAvatar: null,
  type: "INSIGHT",
  content: "Publicação de demonstração.",
  tags: [],
  mediaIds: [],
  createdAt: "2026-10-23T12:00:00Z",
  visibility: "PUBLIC",
  status: "ACTIVE",
  counters: { reactions: 0, comments: 0, saves: 0, shares: 0 },
};

function deferredResponse() {
  let resolve!: (value: Partial<ActionResponse>) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<Partial<ActionResponse>>((fulfill, fail) => {
    resolve = fulfill;
    reject = fail;
  });
  return { promise, resolve, reject };
}

describe("Reações rápidas de uma publicação", () => {
  let root: Root;
  let host: HTMLDivElement;
  let client: QueryClient;
  let controls: UsePostReactionResult[];
  let now: number;

  function Probe() {
    const actions = usePostReaction(post.id);
    const summary = usePostReaction(post.id);
    const otherPost = usePostReaction("another-post");
    controls = [actions, summary, otherPost];
    return null;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    now = 10_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    mocks.react.mockResolvedValue({ counters: { ...post.counters, reactions: 1 } });
    mocks.removeReaction.mockResolvedValue({ counters: post.counters });
    client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: Infinity } } });
    usePostCardStore.setState({ cards: {} });
    usePostCardStore.getState().initializePostCard(post);
    usePostCardStore.getState().initializePostCard({ ...post, id: "another-post" });
    host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <Probe />
        </QueryClientProvider>,
      );
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    usePostCardStore.setState({ cards: {} });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("aceita uma única ação antes de cancelar as leituras, mesmo entre duas instâncias", async () => {
    const response = deferredResponse();
    mocks.react.mockReturnValue(response.promise);

    await act(async () => {
      controls[0].toggle("LOVE");
      controls[1].toggle("LOVE");
      controls[0].toggle("WOW");
    });

    expect(mocks.react).toHaveBeenCalledTimes(1);
    expect(mocks.react).toHaveBeenCalledWith(post.id, "LOVE");
    expect(usePostCardStore.getState().cards[post.id].postCounters.reactions).toBe(1);

    now += 1_000;
    await act(async () => controls[1].toggle("WOW"));
    expect(mocks.react).toHaveBeenCalledTimes(1);
    expect(mocks.removeReaction).not.toHaveBeenCalled();

    await act(async () => response.resolve({ counters: { ...post.counters, reactions: 1 } }));
    expect(usePostCardStore.getState().cards[post.id].reactionPending).toBe(false);
  });

  it("ignora o segundo clique rápido mesmo depois de uma resposta imediata", async () => {
    await act(async () => controls[0].toggle("LOVE"));
    now += 100;
    await act(async () => controls[1].toggle("LOVE"));

    expect(mocks.react).toHaveBeenCalledTimes(1);
    expect(mocks.removeReaction).not.toHaveBeenCalled();
    expect(usePostCardStore.getState().cards[post.id].reactionStatus).toBe("LOVE");

    now += 401;
    await act(async () => controls[1].toggle("LOVE"));
    expect(mocks.removeReaction).toHaveBeenCalledTimes(1);
    expect(usePostCardStore.getState().cards[post.id].reactionStatus).toBeNull();
  });

  it("mantém posts diferentes independentes", async () => {
    const response = deferredResponse();
    mocks.react.mockReturnValue(response.promise);

    await act(async () => {
      controls[0].toggle("LOVE");
      controls[2].toggle("LIKE");
    });

    expect(mocks.react).toHaveBeenCalledTimes(2);
    expect(mocks.react).toHaveBeenCalledWith(post.id, "LOVE");
    expect(mocks.react).toHaveBeenCalledWith("another-post", "LIKE");
    await act(async () => response.resolve({ counters: { ...post.counters, reactions: 1 } }));
  });

  it("restaura o estado após falha e permite uma nova tentativa", async () => {
    const response = deferredResponse();
    mocks.react.mockReturnValueOnce(response.promise);

    await act(async () => controls[0].toggle("LOVE"));
    expect(usePostCardStore.getState().cards[post.id].reactionStatus).toBe("LOVE");
    await act(async () => response.reject(new Error("Falha simulada")));
    expect(usePostCardStore.getState().cards[post.id].reactionStatus).toBeNull();
    expect(usePostCardStore.getState().cards[post.id].reactionPending).toBe(false);

    now += 401;
    await act(async () => controls[1].toggle("WOW"));
    expect(mocks.react).toHaveBeenCalledTimes(2);
    expect(usePostCardStore.getState().cards[post.id].reactionStatus).toBe("WOW");
  });
});
