import type { AutoplayVideo } from "./autoplay-video";

/**
 * Tudo que o coordenador de autoplay pede ao ambiente (navegador ou falso de teste). Injetar isso
 * mantém a lógica pura e testável sem DOM. `createObserver` é `null` quando não há
 * `IntersectionObserver`.
 */
export type AutoplayEnvironment = {
  createObserver:
    | ((onChange: (changes: { target: unknown; isIntersecting: boolean }[]) => void) => {
        observe(video: AutoplayVideo): void;
        unobserve(video: AutoplayVideo): void;
        disconnect(): void;
      })
    | null;
  viewportHeight(): number;
  isHidden(): boolean;
  onVisibilityChange(callback: () => void): () => void;
  onViewportChange(callback: () => void): () => void;
  schedule(callback: () => void): void;
};
