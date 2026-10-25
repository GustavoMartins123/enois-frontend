import type { PostCardState } from "@/types/stores/post-card-state";
import { describe, expect, it } from "vitest";

import { selectCommentMentions, selectLocalComments } from "./post-card.store";

/**
 * O `useSyncExternalStore` (zustand) compara o snapshot por REFERÊNCIA. Um seletor que devolve
 * `?? []` cria um array novo a cada leitura → o React entende que o estado mudou e renderiza de
 * novo: é o aviso "The result of getSnapshot should be cached to avoid an infinite loop".
 *
 * Em 2026-10-24 isso acontecia na página do post (o primeiro render, antes do card entrar no
 * store) e no post do blog (que nunca registra o card). O conserto é devolver a MESMA referência
 * quando não há nada — este teste trava isso.
 */
describe("seletores do store de cards", () => {
  /** Card de exemplo com todos os campos do estado (o seletor só usa dois, mas o tipo exige o resto). */
  function card(localComments: PostCardState["localComments"]): PostCardState {
    return {
      draft: "",
      commentMentions: [],
      replyToId: null,
      localComments,
      postCounters: { comments: 0, shares: 0, saves: 0 } as PostCardState["postCounters"],
      reactionStatus: null,
      reactionSummary: null,
      reactionPending: false,
      showReactions: false,
      showSeals: false,
      showReport: false,
    };
  }

  it("devolve a mesma referência quando o post não está no store", () => {
    const primeira = selectLocalComments("post_inexistente")({ cards: {} });
    const segunda = selectLocalComments("post_inexistente")({ cards: {} });
    expect(primeira).toBe(segunda);
    expect(primeira).toEqual([]);
  });

  it("vale para as menções também", () => {
    const primeira = selectCommentMentions("post_inexistente")({ cards: {} });
    const segunda = selectCommentMentions("post_inexistente")({ cards: {} });
    expect(primeira).toBe(segunda);
    expect(primeira).toEqual([]);
  });

  it("devolve o valor do store quando o post existe", () => {
    const comentarios = [{ id: "c1" }] as PostCardState["localComments"];
    const estado = { cards: { post_1: { ...card(comentarios), commentMentions: ["@ana"] } } };
    expect(selectLocalComments("post_1")(estado)).toBe(comentarios);
    expect(selectCommentMentions("post_1")(estado)).toEqual(["@ana"]);
  });
});
