import type { PostSeals } from "@/types/application/feed/post-seals";

/** Um card esperando os selos do seu post dentro do lote em andamento. */
export type SealsWaiter = {
  resolve: (seals: PostSeals) => void;
  reject: (error: unknown) => void;
};
