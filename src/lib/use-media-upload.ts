import { useCallback, useState } from "react";

import { randomUUID } from "@/lib/api-client";
import { mediaApi } from "@/lib/api/media";
import type { UploadInput } from "@/types/media-upload/upload-input";
import type { UploadResult } from "@/types/media-upload/upload-result";
import type { UploadState } from "@/types/media-upload/upload-state";

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function genFileName(file: File): string {
  const key = randomUUID();
  return `media/${key}/${sanitizeName(file.name)}`;
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({ status: "idle", progress: 0 });

  const upload = useCallback(async (file: File, purpose = "POST_IMAGE"): Promise<UploadResult> => {
    setState({ status: "uploading", progress: 0 });

    try {
      const fileName = genFileName(file);
      const { id, cdnUrl } = await mediaApi.requestUpload({
        fileName,
        mimeType: file.type,
        size: file.size,
        purpose,
      });

      await mediaApi.uploadToImageKit(cdnUrl, file);

      setState({ status: "done", progress: 100 });
      return { mediaId: id, cdnUrl };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload falhou";
      setState({ status: "error", progress: 0, error: msg });
      throw err;
    }
  }, []);

  const uploadAll = useCallback(
    async (files: UploadInput[]): Promise<UploadResult[]> => {
      if (files.length === 0) return [];
      setState({ status: "uploading", progress: 0 });

      const results: UploadResult[] = [];
      for (let i = 0; i < files.length; i++) {
        const { file, purpose = "POST_IMAGE" } = files[i];
        try {
          const fileName = genFileName(file);
          const { id, cdnUrl } = await mediaApi.requestUpload({
            fileName,
            mimeType: file.type,
            size: file.size,
            purpose,
          });
          await mediaApi.uploadToImageKit(cdnUrl, file);
          results.push({ mediaId: id, cdnUrl });
          setState((s) => ({ ...s, progress: Math.round(((i + 1) / files.length) * 100) }));
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload falhou";
          setState({ status: "error", progress: 0, error: msg });
          throw err;
        }
      }

      setState({ status: "done", progress: 100 });
      return results;
    },
    [],
  );

  return { ...state, upload, uploadAll };
}
