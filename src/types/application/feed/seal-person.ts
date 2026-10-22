/**
 * Um selo e quem deu — a linha da lista de "quem marcou" (a mesma ideia da lista de quem reagiu).
 * A pessoa aparece uma vez por selo: quem marcou com dois aparece em duas linhas.
 */
export type SealPerson = {
  userId: string;
  /** Identificador do selo (ver constants/post-seals.ts). */
  seal: string;
  createdAt: string;
};
