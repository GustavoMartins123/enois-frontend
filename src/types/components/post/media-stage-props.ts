export type MediaStageProps = {
  src: string;
  /** Segundo em que o vídeo estava quando a pessoa pediu para assistir. */
  initialTime?: number;
  /**
   * Abre com o som ligado? O palco só nasce de um toque ("quero assistir"), então o som vem
   * junto — e o botão de silenciar fica à mão.
   */
  muted?: boolean;
  /** Fecha o palco e devolve onde o vídeo parou, para o card continuar do mesmo ponto. */
  onClose: (time: number) => void;
};
