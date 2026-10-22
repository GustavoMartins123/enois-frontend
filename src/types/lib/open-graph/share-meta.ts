/** Metadados que a miniatura do link mostra (Open Graph + card do Twitter/X). */
export type ShareMeta = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  /** Endereço direto do vídeo, quando o post tem um (Telegram/X montam o player com ele). */
  videoUrl: string | null;
  type: "article" | "video.other";
};
