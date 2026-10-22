import type { GameView } from "./game-view";

/** Uma página do catálogo: os itens e o cursor da próxima (nulo quando acabou). */
export type GamePage = {
  items: GameView[];
  nextCursor: string | null;
};
