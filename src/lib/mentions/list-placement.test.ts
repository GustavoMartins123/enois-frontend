import { describe, expect, it } from "vitest";

import {
  MENTION_LIST_GAP,
  MENTION_LIST_MAX_HEIGHT,
  mentionListSide,
  mentionListSpaceAbove,
} from "./list-placement";

describe("mentionListSide", () => {
  it("abre para cima quando o teto da lista cabe acima do campo", () => {
    // Comentário no fim da página: sobra espaço acima e pouco abaixo.
    expect(mentionListSide(400, 80, MENTION_LIST_MAX_HEIGHT)).toBe("above");
  });

  it("abre para baixo quando não cabe acima e sobra espaço abaixo", () => {
    // Composer do /feed, logo sob o header: a lista de 192px não cabe acima.
    expect(mentionListSide(72, 640, MENTION_LIST_MAX_HEIGHT)).toBe("below");
  });

  it("com os dois lados apertados, escolhe o maior", () => {
    expect(mentionListSide(100, 40, MENTION_LIST_MAX_HEIGHT)).toBe("above");
    expect(mentionListSide(40, 100, MENTION_LIST_MAX_HEIGHT)).toBe("below");
  });

  it("não sobe quando a margem de 4px estoura o teto", () => {
    const clearance = MENTION_LIST_MAX_HEIGHT + MENTION_LIST_GAP;

    expect(mentionListSide(MENTION_LIST_MAX_HEIGHT, 800)).toBe("below");
    expect(mentionListSide(clearance, 40)).toBe("above");
  });
});

describe("mentionListSpaceAbove", () => {
  const clearance = MENTION_LIST_MAX_HEIGHT + MENTION_LIST_GAP;

  it("desconta o header sticky que ainda está na janela", () => {
    // Composer do /feed: header de 64px e campo a 108px. O vão de 44px não comporta a lista.
    expect(mentionListSpaceAbove(108, 64)).toBe(44);
    expect(mentionListSide(44, 640, clearance)).toBe("below");
  });

  it("sobe quando a lista termina na base do header", () => {
    // 64 + 192 + 4. Abaixo disso a lista cobriria a busca.
    expect(mentionListSpaceAbove(260, 64)).toBe(clearance);
    expect(mentionListSide(mentionListSpaceAbove(260, 64), 80, clearance)).toBe("above");
    expect(mentionListSide(mentionListSpaceAbove(259, 64), 400, clearance)).toBe("below");
  });

  it("ignora o header que já saiu por cima da janela", () => {
    expect(mentionListSpaceAbove(400, -20)).toBe(400);
  });
});
