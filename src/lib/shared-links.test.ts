import { describe, expect, it } from "vitest";

import { hideExternalPageUrls } from "./shared-links";

describe("hideExternalPageUrls", () => {
  it("esconde página externa do texto (o card representa o link)", () => {
    expect(hideExternalPageUrls("Olha essa matéria https://exemplo.com/noticia legal")).toBe(
      "Olha essa matéria  legal",
    );
  });

  it("mantém GIF, vídeo, imagem e áudio diretos (viram mídia, não somem)", () => {
    const url = "https://x.com/anim.gif";
    expect(hideExternalPageUrls(`olha ${url}`)).toContain(url);
    expect(hideExternalPageUrls("https://youtu.be/dQw4w9WgXcQ")).toContain("https://youtu.be/dQw4w9WgXcQ");
    expect(hideExternalPageUrls("https://x.com/foto.png")).toContain("https://x.com/foto.png");
    expect(hideExternalPageUrls("https://x.com/som.mp3")).toContain("https://x.com/som.mp3");
  });

  it("mantém a mídia da casa (imagem relativa continua imagem)", () => {
    expect(hideExternalPageUrls("foto: /media/xyz/foto.png")).toContain("/media/xyz/foto.png");
  });

  it("limpa espaços e linhas em branco deixados pelo link", () => {
    expect(hideExternalPageUrls("texto\nhttps://exemplo.com\n\nfim")).toBe("texto\n\nfim");
  });
});
