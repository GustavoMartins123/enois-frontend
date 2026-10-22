export type MediaItem = {
  type: "image" | "video" | "audio";
  file: File;
  preview: string;
};
