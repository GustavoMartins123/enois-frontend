import type { AutoplayVideo } from "./autoplay-video";

/**
 * Registro de um vídeo no coordenador de autoplay: se está perto da tela, quantos play/pause
 * do coordenador ainda aguardam o evento (o resto é da pessoa) e se o autoplay está impedido para ele.
 */
export type AutoplayEntry = {
  video: AutoplayVideo;
  order: number;
  near: boolean;
  /** Quantos eventos `play` ainda esperados foram causados pelo coordenador (eventos chegam depois da chamada). */
  pendingPlay: number;
  /** Quantos eventos `pause` ainda esperados foram causados pelo coordenador. */
  pendingPause: number;
  suppressed: boolean;
  blocked: boolean;
  cleanup: () => void;
};
