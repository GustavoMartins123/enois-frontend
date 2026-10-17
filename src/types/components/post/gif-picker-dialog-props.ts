export type GifPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recebe a URL da mídia escolhida (ou do link colado no modo alternativo). */
  onSelect: (url: string) => void;
};
