import { api } from "../api-client";

export interface ImageKitAuth {
  signature: string;
  token: string;
  expire: number;
}

export async function getImageKitAuth(): Promise<ImageKitAuth> {
  return api.get<ImageKitAuth>("/media/imagekit-auth");
}
