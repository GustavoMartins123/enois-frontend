import type { PostSealCount } from "./post-seal-count";

export type PostSeals = {
  /** Contagens do maior para o menor; vazio = ninguém marcou nada. */
  seals: PostSealCount[];
  /** Os selos de quem está lendo (pode haver mais de um), para acender todos no seletor. */
  mySeals: string[];
};
