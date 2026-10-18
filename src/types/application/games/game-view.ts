/** Jogo do agregador (Parte E): o Énóis NÃO hospeda — o criador envia o LINK publicado
 * em outro lugar (itch.io, site próprio) e o jogo roda EMBUTIDO num quadro isolado. */
export type GameView = {
  id: string;
  userId: string;
  /** Endereço público: /games/{username}/{slug} — resolvido do perfil pelo backend. */
  username?: string | null;
  slug: string;
  title: string;
  description?: string | null;
  cover?: string | null;
  url: string;
  tags?: string | null;
  status: "SUBMITTED" | "PUBLISHED" | "REJECTED";
  reviewNote?: string | null;
  submittedAt: string;
};
