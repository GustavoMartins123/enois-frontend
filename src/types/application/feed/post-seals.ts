import type { PostSealCount } from "./post-seal-count";

export type PostSeals = {
  /** Contagens do maior para o menor; vazio = ninguém marcou nada. */
  seals: PostSealCount[];
  /** O selo de quem está lendo, quando há um. */
  mySeal: string | null;
};
