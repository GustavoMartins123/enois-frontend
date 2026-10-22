import type { EmbedPlayerProps } from "@/types/components/post/embed-player-props";

/** Detecta URL de vídeo (YouTube/Vimeo/Dailymotion/Twitch) no conteúdo do post. */
export function extractVideoId(url: string): EmbedPlayerProps | null {
  const patterns: [RegExp, EmbedPlayerProps["type"]][] = [
    // YouTube: `watch` (o `v` pode vir depois de outros parâmetros, como no compartilhamento do
    // celular), `youtu.be`, `embed`, `shorts`, `live`, `v` e a origem `youtube-nocookie`. Todos
    // tocam no mesmo `youtube.com/embed/{id}` — sem `shorts`/`live` aqui, o link caía no card
    // "abrir no site" em vez do player.
    [
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#\s]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      "youtube",
    ],
    [/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/, "dailymotion"],
    [/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/, "vimeo"],
    [/(?:twitch\.tv\/videos\/|clips\.twitch\.tv\/)([a-zA-Z0-9_-]+)/, "twitch"],
    // O Spotify precisa do TIPO no caminho do embed (`embed/track/{id}`); só o id dava 404.
    [
      /open\.spotify\.com\/(?:intl-[a-z]+\/)?((?:track|album|playlist|episode|show|artist)\/[a-zA-Z0-9]+)/,
      "spotify",
    ],
    [/twitch\.tv\/([a-zA-Z0-9_]+)\/?$/, "twitch"],
  ];
  for (const [regex, type] of patterns) {
    const m = url.match(regex);
    if (m) return { type, id: m[1] };
  }
  return null;
}
