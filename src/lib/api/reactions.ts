import { api } from "../api-client";

export interface ActionResponse {
  postId: string;
  status: string;
  counters: {
    reactions: number;
    comments: number;
    saves: number;
    shares: number;
  };
}

export const reactionsApi = {
  react: (postId: string, type = "LIKE") =>
    api.post<ActionResponse>(`/feed/posts/${postId}/reactions`, { type }),

  removeReaction: (postId: string) => api.delete<ActionResponse>(`/feed/posts/${postId}/reactions`),

  save: (postId: string) => api.post<ActionResponse>(`/feed/posts/${postId}/saves`),

  removeSave: (postId: string) => api.delete<ActionResponse>(`/feed/posts/${postId}/saves`),

  share: (postId: string) => api.post<ActionResponse>(`/feed/posts/${postId}/shares`),
};
