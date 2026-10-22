export type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  imageSrc: string;
  aspect: number;
  title: string;
  onCropComplete: (blob: Blob) => Promise<void>;
};
