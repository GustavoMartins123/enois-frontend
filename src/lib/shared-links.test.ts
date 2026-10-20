import { describe, expect, it } from "vitest";

import { hideExternalPageUrls, rendersInline, trimTrailingPunctuation } from "./shared-links";

describe("hideExternalPageUrls", () => {
  it("esconde página externa do texto (o card representa o link)", () => {
    expect(hideExternalPageUrls("Olha essa matéria https://exemplo.com/noticia legal")).toBe(
      "Olha essa matéria  legal",
    );
  });

  it("mantém GIF, vídeo, imagem e áudio diretos (viram mídia, não somem)", () => {
    const url = "https://x.com/anim.gif";
    expect(hideExternalPageUrls(`olha ${url}`)).toContain(url);
    expect(hideExternalPageUrls("https://x.com/foto.png")).toContain("https://x.com/foto.png");
    expect(hideExternalPageUrls("https://x.com/som.mp3")).toContain("https://x.com/som.mp3");
  });

  it("esconde o link de player: o player abaixo o representa, sem link cru no texto", () => {
    expect(hideExternalPageUrls("https://youtu.be/dQw4w9WgXcQ")).not.toContain("youtu");
    expect(
      hideExternalPageUrls("olha https://youtube.com/shorts/dQw4w9WgXcQ?si=abc"),
    ).not.toContain("youtu");
    expect(
      hideExternalPageUrls("https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ"),
    ).not.toContain("youtu");
  });

  it("mantém a mídia da casa (imagem relativa continua imagem)", () => {
    expect(hideExternalPageUrls("foto: /media/xyz/foto.png")).toContain("/media/xyz/foto.png");
  });

  it("limpa espaços e linhas em branco deixados pelo link", () => {
    expect(hideExternalPageUrls("texto\nhttps://exemplo.com\n\nfim")).toBe("texto\n\nfim");
  });
});

/**
 * A regra que impede o GIF DUPLICADO: o que o RichText já desenha no corpo do texto (mídia
 * direta) NÃO pode ganhar uma segunda cópia no LinkPreviews logo abaixo — era exatamente o que
 * acontecia no comentário (GIF inline + card com o mesmo GIF).
 */
describe("rendersInline", () => {
  it("marca a mídia direta: quem desenha é o RichText, o preview não repete", () => {
    for (const url of [
      "https://media.giphy.com/media/abc123/giphy.gif",
      "https://media1.tenor.com/m/abc123/tenor.gif",
      "https://i.giphy.com/abc123.gif",
      "https://giphy.com/gifs/reaction-abc123",
      "https://exemplo.com/foto.PNG",
      "https://exemplo.com/clipe.mp4",
      "https://exemplo.com/som.mp3",
      "/media/xyz/foto.png",
    ]) {
      expect(rendersInline(url), url).toBe(true);
    }
  });

  it("não marca player nem página comum: esses o LinkPreviews representa", () => {
    for (const url of [
      "https://youtu.be/dQw4w9WgXcQ",
      "https://exemplo.com/noticia",
      "https://tenor.com/view/gato-engracado-12345",
    ]) {
      expect(rendersInline(url), url).toBe(false);
    }
  });
});

describe("trimTrailingPunctuation", () => {
  it("tira a pontuação da frase antes da checagem de mídia", () => {
    // `.../giphy.gif.` — o ponto é da frase; sem tirá-lo a checagem falhava por um caractere e o
    // GIF aparecia duas vezes (imagem no texto + card do link).
    expect(
      rendersInline(trimTrailingPunctuation("https://media.giphy.com/media/x/giphy.gif.")),
    ).toBe(true);
    expect(rendersInline(trimTrailingPunctuation("https://exemplo.com/foto.png,"))).toBe(true);
    expect(trimTrailingPunctuation("https://exemplo.com/noticia?utm=1")).toBe(
      "https://exemplo.com/noticia?utm=1",
    );
  });
});
