export type MediaUploadResponse = {
  id: string;
  /**
   * Como subir o arquivo. `S3` = `uploadUrl` é uma URL assinada e o arquivo vai por `PUT`
   * (repetindo `uploadHeaders` exatamente). `IMAGEKIT` (ou ausente, para servidor antigo) = o fluxo
   * multipart assinado de sempre — é o campo que permite os dois provedores conviverem.
   */
  provider?: "IMAGEKIT" | "S3";
  /** Só é URL de subida quando o provedor é S3; com ImageKit é o destino, não um endereço chamável. */
  uploadUrl: string;
  uploadMethod?: string | null;
  uploadHeaders?: Record<string, string>;
  cdnUrl: string;
  status: "PENDING" | "UPLOADED" | "FAILED";
};
