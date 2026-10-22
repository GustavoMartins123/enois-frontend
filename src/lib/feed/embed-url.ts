/**
 * Endereço do quadro de cada provedor, com as opções que o navegador exige para tocar sozinho.
 *
 * Autoplay sem gesto do usuário só é permitido **mudo** — é regra do navegador, não escolha nossa.
 * Então o play automático vem `mute`, e o som fica a um toque (o próprio botão do player, ou o
 * clique na capa, que conta como gesto e monta o player com som).
 *
 * Spotify fica de fora do automático de propósito: é áudio, e música começando sozinha num feed é
 * agressivo — e seria bloqueada pelo navegador de qualquer forma.
 */
export function buildEmbedUrl(
  type: string,
  id: string,
  options: { autoplay?: boolean; host?: string } = {},
): string {
  const autoplay = options.autoplay === true;

  switch (type) {
    case "youtube":
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0`;
    case "vimeo":
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&playsinline=1`;
    case "dailymotion":
      return `https://www.dailymotion.com/embed/video/${id}?autoplay=1&mute=1`;
    case "twitch":
      return `https://player.twitch.tv/?video=${id}&parent=${options.host ?? ""}&autoplay=${autoplay}&muted=true`;
    case "spotify":
      return `https://open.spotify.com/embed/${id}`;
    default:
      return "";
  }
}
