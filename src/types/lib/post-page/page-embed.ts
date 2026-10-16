import type { EmbedPlayerProps } from "@/types/components/post/embed-player-props";

/** Mídia embutida reconhecida dentro de uma página (endereço original + provedor/id do player). */
export type PageEmbed = EmbedPlayerProps & {
  url: string;
};
