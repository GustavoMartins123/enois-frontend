/**
 * Modo lite + mídia: liberar o que ninguém está olhando.
 *
 * Vídeo parado continua segurando buffer e decodificador — num aparelho fraco, dez vídeos no
 * feed são dez decodificadores esperando. No palco (o vídeo aberto em tela cheia) a gente pausa
 * todo o resto e DEVOLVE A MEMÓRIA dos vídeos que estão fora da tela. O que está à vista fica
 * intocado: nada pisca, nada recarrega na cara de quem está lendo.
 *
 * O endereço sai do `src` (o React não reescreve um atributo que já escreveu antes, então quem
 * devolve é `restoreSuspendedMedia`).
 */
const SOURCE_ATTRIBUTE = "data-lite-src";

/** O elemento está fora da tela (nem um pixel à vista)? */
export function isOffscreen(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return rect.height <= 0 || rect.bottom <= 0 || rect.top >= viewportHeight;
}

/**
 * Pausa tudo (menos `keep`) e libera o `src` dos vídeos/áudios fora da tela. Devolve quantos
 * foram liberados — o número é o que dá para medir em teste e em verificação manual.
 */
export function suspendOffscreenMedia(keep: Element | null): number {
  if (typeof document === "undefined") return 0;
  let released = 0;
  for (const element of document.querySelectorAll("video, audio")) {
    const media = element as HTMLMediaElement;
    if (media === keep) continue;
    if (!media.paused) media.pause();
    if (!isOffscreen(media)) continue;
    const source = media.getAttribute("src");
    if (!source || media.dataset.liteSrc) continue;
    media.dataset.liteSrc = source;
    media.removeAttribute("src");
    // `load()` é o que descarta o buffer e solta o decodificador.
    media.load();
    released += 1;
  }
  return released;
}

/** Devolve o endereço de quem foi liberado (o quadro volta a carregar quando entra na tela). */
export function restoreSuspendedMedia(): number {
  if (typeof document === "undefined") return 0;
  let restored = 0;
  for (const element of document.querySelectorAll(`[${SOURCE_ATTRIBUTE}]`)) {
    const media = element as HTMLMediaElement;
    const source = media.dataset.liteSrc;
    delete media.dataset.liteSrc;
    if (!source || media.getAttribute("src")) continue;
    media.setAttribute("src", source);
    media.load();
    restored += 1;
  }
  return restored;
}
