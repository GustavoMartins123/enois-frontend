import type { MediaUploadResponse } from "@/types/application/media/media-upload-response";

export type UploadResult = {
  mediaId: MediaUploadResponse["id"];
  cdnUrl: MediaUploadResponse["cdnUrl"];
};
