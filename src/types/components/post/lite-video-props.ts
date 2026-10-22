export type LiteVideoProps = {
  /** Endereço já resolvido (o componente não desenha nada sem ele). */
  src?: string;
  className?: string;
  /** O player da página é mudo por padrão (autoplay só é liberado sem som). */
  muted?: boolean;
  /** Registra no coordenador de autoplay do feed (um vídeo por vez, sempre mudo). */
  registerRef?: (element: HTMLVideoElement | null) => (() => void) | undefined;
};
