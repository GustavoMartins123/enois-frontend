export type UploadState = {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};
