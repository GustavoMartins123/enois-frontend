/**
 * O mínimo que o coordenador de autoplay precisa de um `<video>`. `HTMLVideoElement` satisfaz esta
 * forma, e os testes usam um falso sem precisar de DOM.
 */
export type AutoplayVideo = {
  readonly paused: boolean;
  muted: boolean;
  play(): Promise<void>;
  pause(): void;
  getBoundingClientRect(): { top: number; height: number };
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
};
