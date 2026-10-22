import type { TileState } from "./tile-state";

export interface TileProps {
  letter: string;
  state: TileState;
  revealed: boolean;
  /** Índice da coluna (0-4) — controla o delay do flip. */
  col: number;
  /** Se true, anima o flip ao ser revelado. */
  animate: boolean;
}
